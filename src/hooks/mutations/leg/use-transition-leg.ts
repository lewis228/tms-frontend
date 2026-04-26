import { useMutation, useQueryClient } from "@tanstack/react-query";

import { transitionLeg } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { LegStatus, UseMutationCallback } from "@/types";

type Vars = { id: number; target: LegStatus; failureReason?: string };

export function useTransitionLeg(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, target, failureReason }: Vars) =>
      transitionLeg(id, target, failureReason ?? null),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.leg.byDeliveryOrder(data.deliveryOrderId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(data.deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
