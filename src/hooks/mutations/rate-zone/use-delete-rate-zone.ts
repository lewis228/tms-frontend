import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRateZone } from "@/api/rate-zone";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteRateZone(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRateZone,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateZone.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
