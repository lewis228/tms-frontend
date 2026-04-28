import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createLegStop } from "@/api/leg-stop";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateLegStop(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLegStop,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legStop.byLeg(data.legId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
