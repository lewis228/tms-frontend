import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTeam } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteTeam(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
