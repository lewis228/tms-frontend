import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateRateQuote,
  type RateQuoteCreatePayload,
} from "@/api/rate-quote";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Args = { id: number; payload: Partial<RateQuoteCreatePayload> };

export function useUpdateRateQuote(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Args) => updateRateQuote(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateQuote.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
