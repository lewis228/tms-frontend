import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTruck } from "@/api/truck";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteTruck(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTruck,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.truck.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
