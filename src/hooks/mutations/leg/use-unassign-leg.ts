import { useMutation, useQueryClient } from "@tanstack/react-query";

import { unassignLeg } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useUnassignLeg(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unassignLeg(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.leg.byDeliveryOrder(data.deliveryOrderId),
      });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(data.deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
