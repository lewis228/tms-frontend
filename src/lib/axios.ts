import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getCurrentTenantId } from "@/lib/tenant-scope";
import { generateRequestId } from "@/lib/request-id";
import { toastError } from "@/lib/toast";
import { generateErrorMessage } from "@/lib/error";

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.0.0";

export const ACCESS_TOKEN_KEY = "access_token";

// `||` fallback catches empty strings in .env (e.g. `VITE_API_URL=`), not just null/undefined.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// All domain endpoints live under /api/v1. Exported separately from
// API_BASE_URL so OAuth popup URLs and refresh calls (which bypass the axios
// instance to avoid its interceptor) can share the same prefix.
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

const api = axios.create({
  baseURL: API_V1_URL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  const headers = config.headers as Record<string, string>;

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // X-Tenant-Id — current selected tenant (URL `/app/:tenantId/*`). Auth endpoints
  // are tenant-agnostic, so skip them; /user/me is too but the header is harmless.
  const tenantId = getCurrentTenantId();
  if (tenantId !== null && !config.url?.startsWith("/auth/")) {
    headers["X-Tenant-Id"] = String(tenantId);
  }

  // Common correlation headers for server logs and client-version gating.
  // X-Request-ID survives retries — the 401-refresh path below preserves it.
  if (!headers["X-Request-ID"]) {
    headers["X-Request-ID"] = generateRequestId();
  }
  headers["X-Client-Type"] = "web";
  headers["X-App-Version"] = APP_VERSION;

  return config;
});

let refreshPromise: Promise<string> | null = null;

// HTTP 401 재시도 경로와 WebSocket 재연결 경로가 동시에 refresh 를 호출할 수
// 있다. 함수 내부에서 in-flight 프로미스를 공유하도록 가드를 둠.
export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const resp = await axios.post(
        `${API_V1_URL}/auth/token/access`,
        {},
        { withCredentials: true },
      );
      const newToken: string = resp.data.access_token;
      setAccessToken(newToken);
      return newToken;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

// JWT 의 exp 클레임을 디코드해 leeway 초 안에 만료되는지 판정. 토큰이 없거나
// 디코드 실패하면 "만료됨" 으로 취급 (호출부가 refresh 로 복구 시도).
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

    // 403 NOT_TENANT_MEMBER — user lost membership (kicked, tenant deleted, or
    // hand-edited URL). Emit a global event so MemberOnlyLayout can clear the
    // scope and redirect to /app (tenant hub). Does not reject with a retry —
    // we want the caller to surface the error normally.
    if (error.response?.status === 403) {
      const data = error.response?.data as
        | { code?: string }
        | undefined;
      if (data?.code === "NOT_TENANT_MEMBER" && typeof window !== "undefined") {
        window.dispatchEvent(new Event("tenant:not-member"));
      }
    }

    // Auto-toast for infrastructure-class failures the caller can't meaningfully
    // recover from. 4xx is left to the caller (form validation, optimistic
    // rollback, etc.) — the dedup layer in lib/toast will collapse duplicates
    // across bursts (e.g. multiple parallel queries all seeing the same 503).
    const status = error.response?.status;
    const isNetworkError = !error.response;
    const isServerError = typeof status === "number" && status >= 500;
    if (
      (isServerError || isNetworkError) &&
      !original?.url?.includes("/auth/token/access")
    ) {
      toastError(generateErrorMessage(error));
    }

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/token/access")
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
      clearAccessToken();
      if (typeof window !== "undefined") {
        // Custom event lets SessionProvider clear Zustand session. Avoids a
        // hard window.location navigation, which on unauthenticated routes
        // (`/`, `/sign-in`) causes an infinite reload loop: the next mount
        // calls fetchMe → 401 → refresh → 401 → nav → reload → ...
        window.dispatchEvent(new Event("auth:session-expired"));
      }
      return Promise.reject(refreshErr);
    }
  },
);

export default api;
