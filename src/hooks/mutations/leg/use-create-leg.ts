import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createLeg } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateLeg(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLeg,
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
