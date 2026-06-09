import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelDeliveryOrder } from "@/api/delivery-order";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: number; reason?: string };

export function useCancelDeliveryOrder(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: Vars) => cancelDeliveryOrder(id, { reason }),
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
