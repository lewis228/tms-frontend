import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateContainer, type ContainerUpdatePayload } from "@/api/container";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useUpdateContainer(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ContainerUpdatePayload }) =>
      updateContainer(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.container.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.container.byDeliveryOrder(data.deliveryOrderId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.container.byId(data.id),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(data.deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
