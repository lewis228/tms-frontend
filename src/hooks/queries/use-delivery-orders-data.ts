import { useQuery } from "@tanstack/react-query";

import { fetchDeliveryOrders } from "@/api/delivery-order";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useDeliveryOrdersData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.deliveryOrder.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchDeliveryOrders({ page, size: PAGE_SIZE }),
  });
}
