import { updateMe } from "@/api/user";
import { useSetSession } from "@/store/session";
import type { AppUser, UseMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useUpdateMe(callbacks?: UseMutationCallback) {
  const setSession = useSetSession();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (updated: AppUser) => {
      // Push the freshly updated profile straight into the Zustand session
      // so every consumer (sidebar header, header avatar, profile page)
      // re-renders with the new values without a second /user/me fetch.
      setSession({ user: updated });
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
