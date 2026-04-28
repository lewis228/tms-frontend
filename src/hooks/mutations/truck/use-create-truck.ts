import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTruck } from "@/api/truck";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateTruck(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTruck,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.truck.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
