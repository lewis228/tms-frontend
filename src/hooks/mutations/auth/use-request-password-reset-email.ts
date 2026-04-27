// 비밀번호 재설정 코드 발송 요청.
import { useMutation } from "@tanstack/react-query";

import { requestPasswordResetEmail } from "@/api/auth";
import type { UseMutationCallback } from "@/types";

export function useRequestPasswordResetEmail(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: requestPasswordResetEmail,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
