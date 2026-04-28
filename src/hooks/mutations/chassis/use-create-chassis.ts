import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createChassis } from "@/api/chassis";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateChassis(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createChassis,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.chassis.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
