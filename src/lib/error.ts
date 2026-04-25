// 백엔드 에러 envelope 매핑.
// 응답 형식: { "error": { "code": "ERR_*", "message": "...", "details": {...} } }
//
// i18n 미도입 (Phase 12 일괄 처리 예정) — 한국어 하드코딩.
import { AxiosError } from "axios";

const CODE_KO: Record<string, string> = {
  // 인증/권한
  ERR_UNAUTHORIZED: "인증이 필요합니다.",
  ERR_FORBIDDEN: "접근 권한이 없습니다.",
  ERR_FORBIDDEN_ROLE: "해당 작업을 수행할 권한이 부족합니다.",
  ERR_TENANT_MISMATCH: "다른 테넌트의 데이터에 접근할 수 없습니다.",
  ERR_TENANT_REQUIRED: "테넌트가 지정되지 않았습니다.",
  ERR_NO_TENANT: "사용자에게 테넌트가 없습니다.",
  ERR_AUTH_INVALID: "이메일 또는 비밀번호가 일치하지 않습니다.",
  ERR_TOKEN_EXPIRED: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  ERR_TOKEN_INVALID: "유효하지 않은 토큰입니다.",
  ERR_TOKEN_TYPE: "토큰 종류가 올바르지 않습니다.",
  ERR_PASSWORD_MISMATCH: "현재 비밀번호가 일치하지 않습니다.",
  ERR_PW_NOT_REQUIRED: "비밀번호 변경이 필요한 상태가 아닙니다.",
  ERR_SUPER_ADMIN_FORBIDDEN: "SUPER_ADMIN 은 API 로 생성할 수 없습니다.",
  ERR_ROLE_HIERARCHY: "본인보다 상위 등급의 사용자를 만들 수 없습니다.",

  // 일반
  ERR_NOT_FOUND: "데이터를 찾을 수 없습니다.",
  ERR_CONFLICT: "이미 존재하는 데이터입니다.",
  ERR_VALIDATION: "입력값이 올바르지 않습니다.",
  ERR_INVALID_STATE_TRANSITION: "현재 상태에서는 이 동작을 수행할 수 없습니다.",
  ERR_INTEGRITY: "데이터 무결성 위반입니다.",
  ERR_DATABASE: "데이터베이스 오류가 발생했습니다.",
  ERR_INTERNAL: "서버 내부 오류가 발생했습니다.",

  // 도메인
  ERR_FILE_NOT_UPLOADED: "파일 업로드가 완료되지 않았습니다.",
  ERR_AI_DISABLED: "AI Intake 가 비활성화되어 있습니다.",
  ERR_APPROVED_LOCKED: "승인된 정산은 수정할 수 없습니다.",
};

type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
};

export function generateErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ErrorEnvelope | undefined;
    const code = body?.error?.code;
    const message = body?.error?.message;
    if (code && CODE_KO[code]) return CODE_KO[code];
    if (message) return message;

    if (!error.response) {
      if (error.code === "ECONNABORTED") return "요청이 시간 초과되었습니다.";
      return "네트워크 오류가 발생했습니다.";
    }
    const status = error.response.status;
    if (status === 401) return CODE_KO.ERR_UNAUTHORIZED;
    if (status === 403) return CODE_KO.ERR_FORBIDDEN;
    if (status === 404) return CODE_KO.ERR_NOT_FOUND;
    if (status === 429) return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    if (status >= 500) return CODE_KO.ERR_INTERNAL;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}
