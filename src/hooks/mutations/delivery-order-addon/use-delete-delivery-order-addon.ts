import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteDeliveryOrderAddon } from "@/api/delivery-order-addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  deliveryOrderId: number;
  addonId: number;
};

export function useDeleteDeliveryOrderAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addonId }: Vars) => deleteDeliveryOrderAddon(addonId),
    onSuccess: (_data, { deliveryOrderId }) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrderAddon.byDeliveryOrder(deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
