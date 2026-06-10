import { useQuery } from "@tanstack/react-query";

import { fetchDeliveryOrderAddons } from "@/api/delivery-order-addon";
import { QUERY_KEYS } from "@/lib/constants";

export function useDeliveryOrderAddonsData(deliveryOrderId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.deliveryOrderAddon.byDeliveryOrder(
      deliveryOrderId ?? 0,
    ),
    queryFn: () => fetchDeliveryOrderAddons(deliveryOrderId!),
    enabled: deliveryOrderId != null,
  });
}
