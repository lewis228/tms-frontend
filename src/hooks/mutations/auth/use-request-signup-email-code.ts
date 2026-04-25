import { requestSignupEmailCode } from "@/api/auth";
import type { UseMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useRequestSignupEmailCode(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: requestSignupEmailCode,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
