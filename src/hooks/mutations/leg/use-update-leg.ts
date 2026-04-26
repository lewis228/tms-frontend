import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type LegUpdatePayload, updateLeg } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: number; payload: LegUpdatePayload };

export function useUpdateLeg(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateLeg(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.leg.byDeliveryOrder(data.deliveryOrderId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(data.deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
