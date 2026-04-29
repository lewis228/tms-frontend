import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLegRate, type LegRateUpdatePayload } from "@/api/leg-rate";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Args = { legId: number; containerId?: number; payload: LegRateUpdatePayload };

export function useUpdateLegRate(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ legId, payload }: Args) => updateLegRate(legId, payload),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.legRate.byLeg(data.legId),
      });
      if (vars.containerId !== undefined) {
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.containerV3.full(vars.containerId),
        });
      }
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
