import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateRateTariff,
  type RateTariffCreatePayload,
} from "@/api/rate-tariff";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Args = { id: number; payload: Partial<RateTariffCreatePayload> };

export function useUpdateRateTariff(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Args) => updateRateTariff(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateTariff.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
