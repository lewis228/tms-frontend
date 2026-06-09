import { useQuery } from "@tanstack/react-query";

import { fetchRateGroups } from "@/api/rate-group";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useRateGroupsData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.rateGroup.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchRateGroups({ page, size: PAGE_SIZE }),
  });
}
