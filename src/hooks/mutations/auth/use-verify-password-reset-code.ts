// 비밀번호 재설정 코드 검증.
import { useMutation } from "@tanstack/react-query";

import { verifyPasswordResetCode } from "@/api/auth";
import type { UseMutationCallback } from "@/types";

export function useVerifyPasswordResetCode(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: verifyPasswordResetCode,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
