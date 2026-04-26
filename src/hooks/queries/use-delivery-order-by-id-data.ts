import { useQuery } from "@tanstack/react-query";

import { fetchDeliveryOrder } from "@/api/delivery-order";
import { QUERY_KEYS } from "@/lib/constants";

export function useDeliveryOrderByIdData(id: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.deliveryOrder.byId(id ?? -1),
    queryFn: () => fetchDeliveryOrder(id!),
    enabled: !!id,
  });
}
