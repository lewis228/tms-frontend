import { useQuery } from "@tanstack/react-query";

import { fetchEquipmentPools } from "@/api/equipment-pool";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useEquipmentPoolsData(page = 1, size = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.equipmentPool.list({ page, size }),
    queryFn: () => fetchEquipmentPools({ page, size }),
  });
}
