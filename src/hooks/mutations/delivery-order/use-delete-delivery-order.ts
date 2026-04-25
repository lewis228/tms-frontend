import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteDeliveryOrder } from "@/api/delivery-order";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteDeliveryOrder(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDeliveryOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
