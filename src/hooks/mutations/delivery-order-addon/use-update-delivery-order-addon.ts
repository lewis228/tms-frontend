import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateDeliveryOrderAddon,
  type DoAddonUpdatePayload,
} from "@/api/delivery-order-addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  deliveryOrderId: number;
  addonId: number;
  payload: DoAddonUpdatePayload;
};

export function useUpdateDeliveryOrderAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addonId, payload }: Vars) =>
      updateDeliveryOrderAddon(addonId, payload),
    onSuccess: (_data, { deliveryOrderId }) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrderAddon.byDeliveryOrder(deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
