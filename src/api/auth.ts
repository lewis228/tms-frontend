import api, {
  API_V1_URL,
  clearAccessToken,
  setAccessToken,
} from "@/lib/axios";
import i18n from "i18next";
import type { AppUser } from "@/types";

// Backend expects HTTP Basic auth on /auth/login (email = username, password).
// Body is empty — axios translates `auth` into an Authorization: Basic header.
export async function signInWithPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data } = await api.post<{ access_token: string }>(
    "/auth/login",
    null,
    { auth: { username: email, password } },
  );
  setAccessToken(data.access_token);
  return data;
}

export async function signOut() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
}

export async function requestSignupEmailCode(email: string) {
  const { data } = await api.post<{
    request_id: string;
    expires_in_sec: number;
  }>("/auth/register/email/request", { email });
  return data;
}

export async function verifySignupEmailCode({
  email,
  requestId,
  code,
}: {
  email: string;
  requestId: string;
  code: string;
}) {
  const { data } = await api.post<{ request_id: string }>(
    "/auth/register/email/verify",
    { email, request_id: requestId, code },
  );
  return data;
}

export async function signUp({
  email,
  password,
  requestId,
}: {
  email: string;
  password: string;
  requestId: string;
}) {
  const { data } = await api.post<{ access_token: string }>("/auth/register", {
    email,
    password,
    request_id: requestId,
  });
  setAccessToken(data.access_token);
  return data;
}

export type OAuthProvider = "google" | "github" | "apple";

type OAuthSuccessMessage = { type: "oauth-success"; access_token: string };
type OAuthErrorMessage = { type: "oauth-error"; message?: string };
type OAuthMessage = OAuthSuccessMessage | OAuthErrorMessage;

function isOAuthMessage(data: unknown): data is OAuthMessage {
  if (typeof data !== "object" || data === null) return false;
  const type = (data as { type?: unknown }).type;
  return type === "oauth-success" || type === "oauth-error";
}

// OAuth popup flow. The popup navigates to the backend's /auth/oauth/:provider
// endpoint, which 302-redirects to Google/Apple, then back to
// `${FRONTEND_URL}/oauth/callback?access_token=...`. The callback page reads
// the token from its URL and posts it back to this opener window.
export function signInWithOAuth(
  provider: OAuthProvider,
): Promise<{ access_token: string }> {
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
        setAccessToken(event.data.access_token);
        resolve({ access_token: event.data.access_token });
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

export async function requestPasswordResetEmail(email: string) {
  const { data } = await api.post<{
    request_id: string;
    expires_in_sec: number;
  }>("/auth/password/reset/request", { email });
  return data;
}

export async function verifyPasswordResetCode({
  email,
  requestId,
  code,
}: {
  email: string;
  requestId: string;
  code: string;
}) {
  const { data } = await api.post<{ request_id: string }>(
    "/auth/password/reset/verify",
    { email, request_id: requestId, code },
  );
  return data;
}

export async function confirmPasswordReset({
  email,
  requestId,
  newPassword,
}: {
  email: string;
  requestId: string;
  newPassword: string;
}) {
  const { data } = await api.post("/auth/password/reset/confirm", {
    email,
    request_id: requestId,
    new_password: newPassword,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<AppUser>("/user/me");
  return data;
}
