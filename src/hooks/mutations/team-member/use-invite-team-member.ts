import { inviteTeamMember } from "@/api/team-member";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useInviteTeamMember(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: (_created, variables) => {
      // Invalidate the member list for the specific team. Variables carry
      // the team id through — the mutation response itself doesn't include
      // team_id.
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.teamMember.listByTeam(variables.teamId),
      });
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
