import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createRateQuote,
  type RateQuoteCreatePayload,
} from "@/api/rate-quote";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateRateQuote(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RateQuoteCreatePayload) => createRateQuote(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateQuote.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
