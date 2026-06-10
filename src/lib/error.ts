// 백엔드 에러 envelope 매핑.
// 응답 형식: { "error": { "code": "ERR_*", "message": "...", "details": {...} } }
//
// 사용자 노출 메시지는 i18n `errors.*` 네임스페이스로 번역한다(루트 CLAUDE.md §6.7).
// 백엔드 코드는 `ERR_` prefix 를 갖고, i18n 키는 prefix 를 뗀 형태다
// (예: ERR_UNAUTHORIZED → errors.UNAUTHORIZED).
import { AxiosError } from "axios";
import i18n from "i18next";

type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
};

function tErr(key: string): string {
  return i18n.t(`errors.${key}`);
}

export function generateErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ErrorEnvelope | undefined;
    const code = body?.error?.code;
    const message = body?.error?.message;

    // 백엔드 코드(ERR_*) → errors.* i18n 키 (prefix 제거 후 매칭).
    if (code) {
      const key = code.replace(/^ERR_/, "");
      if (i18n.exists(`errors.${key}`)) return tErr(key);
    }
    if (message) return message;

    if (!error.response) {
      if (error.code === "ECONNABORTED") return tErr("TIMEOUT");
      return tErr("NETWORK");
    }
    const status = error.response.status;
    if (status === 401) return tErr("UNAUTHORIZED");
    if (status === 403) return tErr("FORBIDDEN");
    if (status === 404) return tErr("NOT_FOUND");
    if (status === 429) return tErr("RATE_LIMITED");
    if (status >= 500) return tErr("INTERNAL");
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return tErr("UNKNOWN");
}
