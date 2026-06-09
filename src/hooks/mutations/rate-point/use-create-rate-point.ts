import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRatePoint } from "@/api/rate-point";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateRatePoint(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRatePoint,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ratePoint.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
