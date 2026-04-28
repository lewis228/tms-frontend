import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLegCharge, type LegChargeUpdatePayload } from "@/api/leg-charge";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useUpdateLegCharge(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LegChargeUpdatePayload }) =>
      updateLegCharge(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legCharge.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legCharge.byLeg(data.legId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
