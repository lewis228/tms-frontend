import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRateGroup } from "@/api/rate-group";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteRateGroup(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRateGroup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateGroup.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
