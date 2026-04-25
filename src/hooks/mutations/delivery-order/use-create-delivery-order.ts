import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDeliveryOrder } from "@/api/delivery-order";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateDeliveryOrder(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDeliveryOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
