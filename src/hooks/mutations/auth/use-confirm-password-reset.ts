import { confirmPasswordReset } from "@/api/auth";
import type { UseMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useConfirmPasswordReset(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
