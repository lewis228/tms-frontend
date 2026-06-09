import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRateMultiplier } from "@/api/rate-multiplier";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteRateMultiplier(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRateMultiplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateMultiplier.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
