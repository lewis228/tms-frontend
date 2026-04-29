import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createLegSegment,
  type LegSegmentCreatePayload,
} from "@/api/leg-segment";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Args = { legId: number; containerId?: number } & Omit<
  LegSegmentCreatePayload,
  "legId"
>;

export function useCreateLegSegment(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ legId, containerId: _cid, ...payload }: Args) =>
      createLegSegment(legId, payload),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.legSegment.byLeg(data.legId),
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
