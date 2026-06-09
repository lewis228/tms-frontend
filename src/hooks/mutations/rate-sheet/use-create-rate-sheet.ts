import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRateSheet } from "@/api/rate-sheet";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateRateSheet(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRateSheet,
    onSuccess: () => {
      qc.resetQueries({ queryKey: QUERY_KEYS.rateSheet.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
