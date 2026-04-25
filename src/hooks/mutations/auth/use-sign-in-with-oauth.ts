import { fetchMe, signInWithOAuth } from "@/api/auth";
import { useSetSession } from "@/store/session";
import { announceLogin } from "@/lib/auth-broadcast";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSignInWithOAuth(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  const setSession = useSetSession();

  return useMutation({
    mutationFn: signInWithOAuth,
    onSuccess: async () => {
      queryClient.clear();
      const me = await fetchMe();
      setSession({ user: me });
      announceLogin(String(me.id));
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
