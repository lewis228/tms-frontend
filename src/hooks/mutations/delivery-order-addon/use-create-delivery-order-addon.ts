import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createDeliveryOrderAddon,
  type DoAddonCreatePayload,
} from "@/api/delivery-order-addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  deliveryOrderId: number;
  payload: DoAddonCreatePayload;
};

export function useCreateDeliveryOrderAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deliveryOrderId, payload }: Vars) =>
      createDeliveryOrderAddon(deliveryOrderId, payload),
    onSuccess: (_data, { deliveryOrderId }) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrderAddon.byDeliveryOrder(deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
