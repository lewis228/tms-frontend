// 비밀번호 재설정 확정 — 새 비밀번호 저장.
import { useMutation } from "@tanstack/react-query";

import { confirmPasswordReset } from "@/api/auth";
import type { UseMutationCallback } from "@/types";

export function useConfirmPasswordReset(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
