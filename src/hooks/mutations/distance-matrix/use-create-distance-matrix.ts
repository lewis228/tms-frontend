import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createDistanceMatrix,
  type DistanceMatrixCreatePayload,
} from "@/api/distance-matrix";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateDistanceMatrix(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DistanceMatrixCreatePayload) =>
      createDistanceMatrix(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.distanceMatrix.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
