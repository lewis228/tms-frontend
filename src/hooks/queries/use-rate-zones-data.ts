import { useQuery } from "@tanstack/react-query";

import { fetchRateZones } from "@/api/rate-zone";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useRateZonesData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.rateZone.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchRateZones({ page, size: PAGE_SIZE }),
  });
}
