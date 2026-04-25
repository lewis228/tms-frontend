import { AxiosError } from "axios";
import i18n from "i18next";

// Server-issued error codes we localise via the `errors.*` namespace in
// `src/i18n/locales/*`. Unknown codes fall through to the server's raw
// `message` field, which is already a reasonable fallback on our backend.
const KNOWN_CODES = new Set([
  "INVALID_CREDENTIALS",
  "USER_NOT_FOUND",
  "EMAIL_ALREADY_EXISTS",
  "INVALID_EMAIL_CODE",
  "EXPIRED_EMAIL_CODE",
  "PASSWORD_TOO_WEAK",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "RATE_LIMITED",
  "INTERNAL_SERVER_ERROR",
  "NOT_TEAM_MEMBER",
  "TEAM_NOT_FOUND",
  "TEAM_SCOPE_REQUIRED",
  // Backend-side codes introduced with the team-scoped tenancy refactor.
  "ALREADY_EXISTS",
  "FK_IN_USE",
  "FK_REFERENCE_NOT_FOUND",
  "TEAM_REQUIRED",
  "RATE_LIMIT_EXCEEDED",
  "BROWSER_ID_MISMATCH",
  "ACCOUNT_SWITCHED",
]);

export function generateErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { code?: string; message?: string }
      | undefined;

    if (data?.code && KNOWN_CODES.has(data.code)) {
      return i18n.t(`errors.${data.code}`);
    }

    if (data?.message) {
      return data.message;
    }

    // No response = network/timeout/CORS error. The backend-message path above
    // already exited; surface a human-friendly default.
    if (!error.response) {
      if (error.code === "ECONNABORTED") return i18n.t("errors.TIMEOUT");
      return i18n.t("errors.NETWORK");
    }

    if (error.response.status === 401) return i18n.t("errors.UNAUTHORIZED");
    if (error.response.status === 403) return i18n.t("errors.FORBIDDEN");
    if (error.response.status === 404) return i18n.t("errors.NOT_FOUND");
    if (error.response.status === 429) return i18n.t("errors.RATE_LIMITED");
    if (error.response.status >= 500)
      return i18n.t("errors.INTERNAL_SERVER_ERROR");

    return error.message;
  }

  if (error instanceof Error) return error.message;
  return i18n.t("errors.UNKNOWN");
}
