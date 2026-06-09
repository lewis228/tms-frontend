import { useQuery } from "@tanstack/react-query";

import { fetchDeliveryOrderActivity } from "@/api/delivery-order";
import { QUERY_KEYS } from "@/lib/constants";

export function useDeliveryOrderActivityData(id: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.deliveryOrder.activity(id ?? -1),
    queryFn: () => fetchDeliveryOrderActivity(id!),
    enabled: !!id,
  });
}
