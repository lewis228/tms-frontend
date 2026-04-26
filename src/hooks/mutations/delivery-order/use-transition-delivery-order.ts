import { useMutation, useQueryClient } from "@tanstack/react-query";

import { transitionDeliveryOrder } from "@/api/delivery-order";
import { QUERY_KEYS } from "@/lib/constants";
import type { DeliveryStatus, UseMutationCallback } from "@/types";

type Vars = { id: number; target: DeliveryStatus };

export function useTransitionDeliveryOrder(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, target }: Vars) => transitionDeliveryOrder(id, target),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(vars.id),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.leg.byDeliveryOrder(vars.id),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
