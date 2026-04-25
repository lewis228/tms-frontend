import { deleteTeam } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTeam(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: ({ team_id }) => {
      // Drop the team detail + members caches so the UI can't read stale
      // data while the user navigates away. The team switcher should
      // refetch its list via team.all invalidation.
      queryClient.removeQueries({ queryKey: QUERY_KEYS.team.byId(team_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMember.all });
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
