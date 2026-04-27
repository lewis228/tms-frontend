// /auth/* 매핑.
//
// 백엔드 (ste 패턴) 는 로그인에 Basic Auth 헤더를 사용한다 — JSON body 가 아님.
// axios 의 `auth` 옵션을 넘기면 자동으로 `Authorization: Basic base64(email:password)` 가 붙는다.
import i18n from "i18next";

import api, { API_V1_URL } from "@/lib/axios";
import type { LoginResponse, TokenPair } from "@/types";

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    "/auth/login",
    null,
    { auth: { username: email, password } },
  );
  return data;
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  // 백엔드: POST /auth/token/refresh — body 는 빈 객체. refresh_token 은 HttpOnly 쿠키로 송신.
  const { data } = await api.post<TokenPair>("/auth/token/refresh", {
    refreshToken,
  });
  return data;
}

// 로그아웃 — 백엔드 세션 무효화. 토큰 클리어는 호출부(useSignOut)가 담당.
export async function signOut(): Promise<void> {
  await api.post("/auth/logout");
}

// 회원가입 이메일 인증 — 1단계: 코드 발송 요청.
export async function requestSignupEmailCode(
  email: string,
): Promise<{ requestId: string; expiresInSec: number }> {
  const { data } = await api.post<{
    request_id: string;
    expires_in_sec: number;
  }>("/auth/register/email/request", { email });
  return { requestId: data.request_id, expiresInSec: data.expires_in_sec };
}

// 회원가입 이메일 인증 — 2단계: 코드 검증.
export async function verifySignupEmailCode({
  email,
  requestId,
  code,
}: {
  email: string;
  requestId: string;
  code: string;
}): Promise<{ requestId: string }> {
  const { data } = await api.post<{ request_id: string }>(
    "/auth/register/email/verify",
    { email, request_id: requestId, code },
  );
  return { requestId: data.request_id };
}

// 회원가입 — 검증된 requestId 와 함께 계정 생성. 응답은 LoginResponse (access + refresh).
export async function signUp({
  email,
  password,
  requestId,
}: {
  email: string;
  password: string;
  requestId: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/register", {
    email,
    password,
    request_id: requestId,
  });
  return data;
}

export type OAuthProvider = "google" | "github" | "apple";

type OAuthSuccessMessage = {
  type: "oauth-success";
  access_token: string;
  refresh_token?: string | null;
};
type OAuthErrorMessage = { type: "oauth-error"; message?: string };
type OAuthMessage = OAuthSuccessMessage | OAuthErrorMessage;

function isOAuthMessage(data: unknown): data is OAuthMessage {
  if (typeof data !== "object" || data === null) return false;
  const type = (data as { type?: unknown }).type;
  return type === "oauth-success" || type === "oauth-error";
}

// OAuth popup flow. The popup navigates to the backend's /auth/oauth/:provider
// endpoint, which 302-redirects to Google/Apple, then back to
// `${VITE_PUBLIC_URL}/oauth/callback?access_token=...&refresh_token=...`. The
// callback page reads the tokens from its URL and posts them back to this
// opener window. The mutation hook handles store update.
export function signInWithOAuth(
  provider: OAuthProvider,
): Promise<{ accessToken: string; refreshToken: string | null }> {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left =
      typeof window !== "undefined"
        ? window.screenX + (window.outerWidth - width) / 2
        : 0;
    const top =
      typeof window !== "undefined"
        ? window.screenY + (window.outerHeight - height) / 2
        : 0;

    const popup = window.open(
      `${API_V1_URL}/auth/oauth/${provider}`,
      "oauth_popup",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      reject(new Error(i18n.t("errors.POPUP_BLOCKED")));
      return;
    }

    const expectedOrigin = window.location.origin;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(pollClosed);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return;
      if (!isOAuthMessage(event.data)) return;

      if (event.data.type === "oauth-success") {
        cleanup();
        if (!popup.closed) popup.close();
        resolve({
          accessToken: event.data.access_token,
          refreshToken: event.data.refresh_token ?? null,
        });
      } else {
        cleanup();
        if (!popup.closed) popup.close();
        reject(new Error(event.data.message ?? i18n.t("errors.OAUTH_FAILED")));
      }
    };

    const pollClosed = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error(i18n.t("errors.OAUTH_WINDOW_CLOSED")));
      }
    }, 500);

    window.addEventListener("message", handleMessage);
  });
}

// 비밀번호 재설정 — 1단계: 코드 발송 요청.
export async function requestPasswordResetEmail(
  email: string,
): Promise<{ requestId: string; expiresInSec: number }> {
  const { data } = await api.post<{
    request_id: string;
    expires_in_sec: number;
  }>("/auth/password/reset/request", { email });
  return { requestId: data.request_id, expiresInSec: data.expires_in_sec };
}

// 비밀번호 재설정 — 2단계: 코드 검증.
export async function verifyPasswordResetCode({
  email,
  requestId,
  code,
}: {
  email: string;
  requestId: string;
  code: string;
}): Promise<{ requestId: string }> {
  const { data } = await api.post<{ request_id: string }>(
    "/auth/password/reset/verify",
    { email, request_id: requestId, code },
  );
  return { requestId: data.request_id };
}

// 비밀번호 재설정 — 3단계: 새 비밀번호 확정.
export async function confirmPasswordReset({
  email,
  requestId,
  newPassword,
}: {
  email: string;
  requestId: string;
  newPassword: string;
}): Promise<{ ok: boolean }> {
  const { data } = await api.post<{ ok?: boolean }>(
    "/auth/password/reset/confirm",
    {
      email,
      request_id: requestId,
      new_password: newPassword,
    },
  );
  return { ok: data?.ok ?? true };
}
