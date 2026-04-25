import { verifySignupEmailCode } from "@/api/auth";
import type { UseMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useVerifySignupEmailCode(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: verifySignupEmailCode,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
