import { useMutation, useQueryClient } from "@tanstack/react-query";

import { assignLeg } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  driverId: number;
  truckId?: number | null;
  chassisId?: number | null;
};

export function useAssignLeg(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, driverId, truckId, chassisId }: Vars) =>
      assignLeg(id, { driverId, truckId, chassisId }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.leg.byDeliveryOrder(data.deliveryOrderId),
      });
      // 배차로 D/O 상태(DISPATCHING/DISPATCHED)가 파생되므로 D/O 캐시도 무효화
      qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.deliveryOrder.byId(data.deliveryOrderId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
