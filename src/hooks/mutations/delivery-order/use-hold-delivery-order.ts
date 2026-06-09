import { useMutation, useQueryClient } from "@tanstack/react-query";

import { holdDeliveryOrder } from "@/api/delivery-order";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: number; onHold: boolean; reason?: string };

export function useHoldDeliveryOrder(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, onHold, reason }: Vars) =>
      holdDeliveryOrder(id, { onHold, reason }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(vars.id),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.activity(vars.id),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
