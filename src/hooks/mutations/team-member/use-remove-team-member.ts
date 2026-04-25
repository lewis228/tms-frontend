import { removeTeamMember } from "@/api/team-member";
import { QUERY_KEYS } from "@/lib/constants";
import type { TeamMemberEntity, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveTeamMember(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTeamMember,
    onSuccess: (result) => {
      // Surgically drop the removed row from the cached list so the UI
      // updates instantly without a round-trip.
      queryClient.setQueryData<TeamMemberEntity[]>(
        QUERY_KEYS.teamMember.listByTeam(result.team_id),
        (prev) => {
          if (!prev) return prev;
          return prev.filter((m) => m.user_id !== result.user_id);
        },
      );
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
