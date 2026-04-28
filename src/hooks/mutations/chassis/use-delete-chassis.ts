import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteChassis } from "@/api/chassis";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteChassis(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteChassis,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.chassis.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
