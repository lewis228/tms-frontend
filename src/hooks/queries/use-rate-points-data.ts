import { useQuery } from "@tanstack/react-query";

import { fetchRatePoints } from "@/api/rate-point";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useRatePointsData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.ratePoint.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchRatePoints({ page, size: PAGE_SIZE }),
  });
}
