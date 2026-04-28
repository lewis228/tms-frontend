import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRateCard } from "@/api/rate-card";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateRateCard(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRateCard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateCard.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
