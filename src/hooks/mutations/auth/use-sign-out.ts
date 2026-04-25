import { signOut } from "@/api/auth";
import { useSetSession } from "@/store/session";
import { announceLogout } from "@/lib/auth-broadcast";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSignOut(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  const setSession = useSetSession();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
      setSession(null);
      announceLogout();
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
