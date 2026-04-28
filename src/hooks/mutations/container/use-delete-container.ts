import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteContainer } from "@/api/container";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteContainer(
  deliveryOrderId: number | null | undefined,
  callbacks?: UseMutationCallback,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContainer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.container.all });
      if (deliveryOrderId) {
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.container.byDeliveryOrder(deliveryOrderId),
        });
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.deliveryOrder.byId(deliveryOrderId),
        });
      }
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
