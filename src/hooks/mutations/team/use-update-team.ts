import { updateTeam } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";
import type { TeamEntity, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateTeam(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeam,
    onSuccess: (updated: TeamEntity) => {
      // Patch the team-detail cache in place so the Settings page shows the
      // new values instantly without a round-trip. Team list views, if/when
      // they exist, should invalidate off of team.all.
      queryClient.setQueryData<TeamEntity>(
        QUERY_KEYS.team.byId(updated.id),
        updated,
      );
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
