import { useQuery } from "@tanstack/react-query";

import { fetchLegsByDeliveryOrder } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";

export function useLegsByDoData(deliveryOrderId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.leg.byDeliveryOrder(deliveryOrderId ?? -1),
    queryFn: () => fetchLegsByDeliveryOrder(deliveryOrderId!),
    enabled: !!deliveryOrderId,
  });
}
