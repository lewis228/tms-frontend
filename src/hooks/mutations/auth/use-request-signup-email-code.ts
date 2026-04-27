// 회원가입 이메일 인증 코드 발송 요청.
import { useMutation } from "@tanstack/react-query";

import { requestSignupEmailCode } from "@/api/auth";
import type { UseMutationCallback } from "@/types";

export function useRequestSignupEmailCode(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: requestSignupEmailCode,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
