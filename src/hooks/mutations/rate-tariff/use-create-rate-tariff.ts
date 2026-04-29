import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createRateTariff,
  type RateTariffCreatePayload,
} from "@/api/rate-tariff";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateRateTariff(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RateTariffCreatePayload) => createRateTariff(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateTariff.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
