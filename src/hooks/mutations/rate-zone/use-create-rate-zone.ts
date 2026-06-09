import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRateZone } from "@/api/rate-zone";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateRateZone(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRateZone,
    onSuccess: () => {
      qc.resetQueries({ queryKey: QUERY_KEYS.rateZone.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
