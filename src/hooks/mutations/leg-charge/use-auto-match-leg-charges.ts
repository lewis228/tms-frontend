import { useMutation, useQueryClient } from "@tanstack/react-query";

import { autoMatchLegCharges } from "@/api/leg-charge";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useAutoMatchLegCharges(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: autoMatchLegCharges,
    onSuccess: (_, legId) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legCharge.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legCharge.byLeg(legId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
