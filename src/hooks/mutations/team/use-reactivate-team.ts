import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reactivateTeam } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useReactivateTeam(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reactivateTeam,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
