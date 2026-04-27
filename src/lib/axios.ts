// 단일 axios 인스턴스. 백엔드 TMS API (FastAPI) 와 매칭.
//
// 인터셉터:
// 1. Request — Authorization: Bearer <access>, X-Team-Id, X-Client-Type, X-Request-ID, X-App-Version.
// 2. Response error — 다음 순서로 분기:
//      a. **세션 불일치 신호** (서버 code: ACCOUNT_SWITCHED / DEVICE_SID_MISMATCH /
//         SESSION_NOT_FOUND / UID_MISMATCH) → 즉시 로컬 로그아웃 + sign-in 으로 hard reload.
//      b. **403 NOT_TEAM_MEMBER 또는 PERMISSION_DENIED(groupId 없음)** →
//         team scope 초기화 + /app 으로 (다른 탭에서 본인이 team 에서 빠진 케이스).
//      c. **401** → POST /auth/token/access (refresh 쿠키로 새 access 받음) → 원 요청 1회 재시도.
//         실패하면 store clear + /sign-in.
//      d. **5xx / 네트워크 / 타임아웃** → 전역 에러 토스트 (toast dedup 자동).
//
// 토큰 모델 (web):
//  - access  : 메모리(zustand) 만 보관 — XSS 노출 시간 최소화.
//  - refresh : 백엔드가 HttpOnly 쿠키로 관리 (JS 접근 불가). withCredentials:true 로 자동 송신.
//  - 따라서 refresh 를 localStorage 에서 읽지 않는다 — 항상 쿠키에 의존.
//
// 동시성:
// - refresh in-flight 인 동안 다른 401 들이 오면 같은 promise 를 await (단일 호출 보장).
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import i18n from "i18next";

import {
  authStore,
  clearAuth,
  getAccessToken,
  setAccessTokenModule,
  getCurrentTeamIdModule,
} from "@/store/auth";
import { generateRequestId } from "@/lib/request-id";
import { toastError } from "@/lib/toast";
import { announceLogout } from "@/lib/auth-broadcast";

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.1.0";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// 백엔드 main.py 가 모든 router 를 /api/v1 prefix 아래에 마운트한다.
// 따라서 프론트 baseURL 도 /api/v1 까지 포함.
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

const api = axios.create({ baseURL: API_V1_URL, withCredentials: true });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  const headers = config.headers as Record<string, string>;

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // X-Team-Id — 백엔드 get_team_scope 가 모든 도메인 endpoint 에서 필수로 요구.
  // 일반 사용자: 자기 멤버십 team 중 currentTeamId 사용.
  // SUPER_ADMIN: 멤버십 없이도 다른 team 조작 (currentTeamId 가 그 대상).
  // /auth/* 는 헤더 불필요.
  const teamId = getCurrentTeamIdModule();
  if (teamId && !config.url?.startsWith("/auth/")) {
    headers["X-Team-Id"] = String(teamId);
  }

  if (!headers["X-Request-ID"]) {
    headers["X-Request-ID"] = generateRequestId();
  }
  headers["X-Client-Type"] = "web";
  headers["X-App-Version"] = APP_VERSION;

  return config;
});

let refreshPromise: Promise<string> | null = null;

// 새 access 토큰 발급. 백엔드 /auth/token/access 가:
//  - 웹: 쿠키의 refresh 를 읽어 access 만 body 로 반환 (refresh 쿠키는 그대로 유지).
//  - 모바일: Authorization: Bearer <refresh> 헤더 사용 (이 프론트는 웹 only).
// 따라서 body 는 비우고 withCredentials 만 켜서 호출한다.
export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const resp = await axios.post<{ accessToken: string }>(
        `${API_V1_URL}/auth/token/access`,
        {},
        {
          withCredentials: true,
          headers: { "X-Client-Type": "web" },
        },
      );
      setAccessTokenModule(resp.data.accessToken);
      return resp.data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export function isAccessTokenExpiringSoon(leewaySec: number = 30): boolean {
  const token = getAccessToken();
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadB64 + "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== "number") return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp - leewaySec <= nowSec;
  } catch {
    return true;
  }
}

// ── 세션 즉시 종료 신호. 토큰 도용 / 디바이스 매핑 불일치 / 다른 탭에서 다른 계정 로그인 등.
const ACCOUNT_SWITCH_CODES = new Set([
  "ACCOUNT_SWITCHED",
  "DEVICE_SID_MISMATCH",
  "SESSION_NOT_FOUND",
  "UID_MISMATCH",
]);

// 응답 body 에서 서버 에러 code 추출. 백엔드가 내려보내는 다양한 shape 대응:
//   { code: "..." }
//   { detail: { code: "..." } }
//   { error: { message: { code: "..." } } }
function extractServerCode(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.code === "string") return d.code;
  if (d.detail && typeof d.detail === "object") {
    const detail = d.detail as Record<string, unknown>;
    if (typeof detail.code === "string") return detail.code;
  }
  if (d.error && typeof d.error === "object") {
    const errBody = d.error as Record<string, unknown>;
    const msg = errBody.message;
    if (msg && typeof msg === "object") {
      const inner = msg as Record<string, unknown>;
      if (typeof inner.code === "string") return inner.code;
    }
  }
  return null;
}

// 백엔드 PERMISSION_DENIED 응답에서 groupId 추출. groupId 가 있으면 단순 권한 부족,
// 없으면 "이 team 의 멤버 아님" 으로 간주 (= NOT_TEAM_MEMBER 와 동일 처리).
function extractPermissionGroupId(data: unknown): unknown {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  const detail = d.detail as Record<string, unknown> | undefined;
  if (detail && "groupId" in detail) return detail.groupId;
  const errBody = d.error as Record<string, unknown> | undefined;
  if (errBody && typeof errBody.message === "object") {
    const inner = errBody.message as Record<string, unknown>;
    if ("groupId" in inner) return inner.groupId;
  }
  return undefined;
}

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const data = error.response?.data;
    const serverCode = extractServerCode(data);

    // ── (a) 세션 즉시 종료 신호 ─────────────────────────────────────────
    if (serverCode && ACCOUNT_SWITCH_CODES.has(serverCode)) {
      clearAuth();
      announceLogout();
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      return Promise.reject(error);
    }

    // ── (b) team 멤버십 박탈 ────────────────────────────────────────
    if (status === 403 && serverCode === "NOT_TEAM_MEMBER") {
      window.dispatchEvent(new CustomEvent("team:not-member"));
      return Promise.reject(error);
    }
    if (status === 403 && serverCode === "PERMISSION_DENIED") {
      const groupId = extractPermissionGroupId(data);
      if (groupId == null) {
        // groupId 없음 = team 자체에서 빠진 상태
        window.dispatchEvent(new CustomEvent("team:not-member"));
        return Promise.reject(error);
      }
      // groupId 있음 = 단순 권한 부족. 도메인 mutation 의 onError 가 토스트.
    }

    // ── (c) 401 → refresh + 1회 재시도 ─────────────────────────────────
    if (
      original &&
      status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/token/access") &&
      !original.url?.includes("/auth/token/refresh") &&
      !original.url?.includes("/auth/login")
    ) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>)["Authorization"] =
          `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        clearAuth();
        announceLogout();
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
        return Promise.reject(refreshErr);
      }
    }

    // ── (d) 5xx / 네트워크 / 타임아웃 → 전역 토스트 ────────────────────
    // 4xx 는 도메인 mutation 의 onError 가 generateErrorMessage 로 처리하므로 skip.
    if (!error.response) {
      // 네트워크 끊김 / 타임아웃
      if (error.code === "ECONNABORTED") {
        toastError(i18n.t("errors.TIMEOUT"));
      } else {
        toastError(i18n.t("errors.NETWORK"));
      }
    } else if (status !== undefined && status >= 500) {
      toastError(i18n.t("errors.INTERNAL_SERVER_ERROR"));
    }

    return Promise.reject(error);
  },
);

// store 가 clear (= access 토큰 사라짐) 되면 in-flight refresh 도 무효화.
authStore.subscribe((state, prev) => {
  if (prev.accessToken && !state.accessToken) {
    refreshPromise = null;
  }
});

export default api;
