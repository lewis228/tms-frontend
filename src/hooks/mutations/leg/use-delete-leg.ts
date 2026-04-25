import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLeg } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

// deliveryOrderId 도 같이 받아 byDeliveryOrder 캐시까지 무효화.
type Vars = { id: string; deliveryOrderId: string };

export function useDeleteLeg(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: Vars) => deleteLeg(id),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.leg.byDeliveryOrder(vars.deliveryOrderId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(vars.deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
