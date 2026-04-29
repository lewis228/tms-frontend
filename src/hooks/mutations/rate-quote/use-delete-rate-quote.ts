import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRateQuote } from "@/api/rate-quote";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteRateQuote(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRateQuote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateQuote.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
