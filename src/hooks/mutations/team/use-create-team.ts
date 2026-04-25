import { createTeam } from "@/api/team";
import { fetchMe } from "@/api/auth";
import { useSetSession } from "@/store/session";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTeam(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  const setSession = useSetSession();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: async () => {
      // Creating a team mutates the user's team list on the server. Re-fetch
      // /user/me so the sidebar / team hub reflects the new membership.
      const me = await fetchMe();
      setSession({ user: me });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
