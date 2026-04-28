import { useQuery } from "@tanstack/react-query";

import { fetchContainers } from "@/api/container";
import { QUERY_KEYS } from "@/lib/constants";

// D/O 1건의 컨테이너 N개 조회. byDelivery_order 인덱스 활용.
export function useContainersByDoData(deliveryOrderId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.container.byDeliveryOrder(deliveryOrderId ?? -1),
    queryFn: () =>
      fetchContainers({
        deliveryOrderId: deliveryOrderId!,
        page: 1,
        size: 100,
      }),
    enabled: !!deliveryOrderId,
  });
}
