import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createContainer } from "@/api/container";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateContainer(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createContainer,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.container.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.container.byDeliveryOrder(data.deliveryOrderId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(data.deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
