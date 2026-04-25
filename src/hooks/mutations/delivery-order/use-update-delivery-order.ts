import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type DeliveryOrderUpdatePayload,
  updateDeliveryOrder,
} from "@/api/delivery-order";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: string; payload: DeliveryOrderUpdatePayload };

export function useUpdateDeliveryOrder(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateDeliveryOrder(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(vars.id),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
