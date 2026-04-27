import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTeam } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateTeam(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
