// 단일 axios 인스턴스. 백엔드 TMS API (FastAPI) 와 매칭.
//
// 인터셉터:
// 1. Request — Authorization: Bearer <access>, X-Tenant-Id (SUPER_ADMIN 만), X-Request-ID.
// 2. Response 401 — refresh token 으로 /api/v1/auth/refresh 호출, 성공 시 원 요청 1회 재시도.
//                    refresh 도 실패하면 store clear + /sign-in.
//
// 동시성:
// - refresh in-flight 인 동안 다른 401 들이 오면 같은 promise 를 await (단일 호출 보장).
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  authStore,
  clearAuth,
  getAccessToken,
  getRefreshToken,
  setTokensModule,
  getCurrentTenantIdModule,
} from "@/store/auth";
import { generateRequestId } from "@/lib/request-id";
import type { TokenPair } from "@/types";

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.1.0";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// 백엔드 ROOT_PATH 는 ""로 시작. 운영에서는 reverse proxy 가 /api/v1 → backend / 로 rewrite.
// 따라서 baseURL 은 그대로 BASE_URL 사용 (prefix 없음).
export const API_V1_URL = API_BASE_URL;

const api = axios.create({ baseURL: API_V1_URL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  const headers = config.headers as Record<string, string>;

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // X-Tenant-Id — 백엔드 get_tenant_scope 가 모든 도메인 endpoint 에서 필수로 요구.
  // 일반 사용자: 자기 멤버십 tenant 중 currentTenantId 사용.
  // SUPER_ADMIN: 멤버십 없이도 다른 tenant 조작 (currentTenantId 가 그 대상).
  // /auth/* 는 헤더 불필요.
  const tenantId = getCurrentTenantIdModule();
  if (tenantId && !config.url?.startsWith("/auth/")) {
    headers["X-Tenant-Id"] = String(tenantId);
  }

  if (!headers["X-Request-ID"]) {
    headers["X-Request-ID"] = generateRequestId();
  }
  headers["X-Client-Type"] = "web";
  headers["X-App-Version"] = APP_VERSION;

  return config;
});

let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const refresh = getRefreshToken();
      if (!refresh) throw new Error("no refresh token");
      const resp = await axios.post<TokenPair>(
        `${API_V1_URL}/auth/token/refresh`,
        { refreshToken: refresh },
      );
      setTokensModule(resp.data.accessToken, resp.data.refreshToken);
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

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/token/refresh") ||
      original.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const newToken = await refreshAccessToken();
      original.headers = original.headers ?? {};
      (original.headers as Record<string, string>)["Authorization"] =
        `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      return Promise.reject(refreshErr);
    }
  },
);

// store 가 clear 되면 in-flight refresh 도 무효화.
authStore.subscribe((state, prev) => {
  if (prev.refreshToken && !state.refreshToken) {
    refreshPromise = null;
  }
});

export default api;
