import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRateSheet } from "@/api/rate-sheet";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteRateSheet(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRateSheet,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateSheet.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
