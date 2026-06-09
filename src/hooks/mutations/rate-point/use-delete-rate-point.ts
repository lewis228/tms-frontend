import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRatePoint } from "@/api/rate-point";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteRatePoint(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRatePoint,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ratePoint.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
