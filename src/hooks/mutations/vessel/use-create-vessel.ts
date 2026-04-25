import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createVessel } from "@/api/vessel";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateVessel(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVessel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.vessel.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
