import { useQuery } from "@tanstack/react-query";

import { fetchRateGroups } from "@/api/rate-group";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

// size: 백엔드 take 로 전달. 이름/방식 enrich 용도 등 첫 페이지보다 많이 필요하면 키운다.
export function useRateGroupsData(page: number = 1, size: number = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.rateGroup.list({ page, size }),
    queryFn: () => fetchRateGroups({ page, size }),
  });
}
