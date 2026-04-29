import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRateTariff } from "@/api/rate-tariff";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteRateTariff(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRateTariff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateTariff.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
