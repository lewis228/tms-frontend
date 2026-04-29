import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  measureDistance,
  type DistanceMeasurePayload,
} from "@/api/distance-matrix";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useMeasureDistance(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DistanceMeasurePayload) => measureDistance(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.distanceMatrix.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
