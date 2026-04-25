import { verifyPasswordResetCode } from "@/api/auth";
import type { UseMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useVerifyPasswordResetCode(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: verifyPasswordResetCode,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
