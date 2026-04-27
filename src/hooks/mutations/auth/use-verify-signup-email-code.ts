// 회원가입 이메일 인증 코드 검증.
import { useMutation } from "@tanstack/react-query";

import { verifySignupEmailCode } from "@/api/auth";
import type { UseMutationCallback } from "@/types";

export function useVerifySignupEmailCode(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: verifySignupEmailCode,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
