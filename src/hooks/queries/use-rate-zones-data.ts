import { useQuery } from "@tanstack/react-query";

import { fetchRateZones } from "@/api/rate-zone";
import { QUERY_KEYS } from "@/lib/constants";

// 존 마스터는 소규모 — rate-lookup 존 이름 맵과 존 목록이 take 100 한 페이지에 의존.
const TAKE = 100;

export function useRateZonesData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.rateZone.list({ page, size: TAKE }),
    queryFn: () => fetchRateZones({ page, size: TAKE }),
  });
}
