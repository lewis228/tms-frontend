import { useQuery } from "@tanstack/react-query";

import { fetchLegsByDeliveryOrder } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";

export function useLegsByDoData(deliveryOrderId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.leg.byDeliveryOrder(deliveryOrderId ?? ""),
    queryFn: () => fetchLegsByDeliveryOrder(deliveryOrderId!),
    enabled: !!deliveryOrderId,
  });
}
