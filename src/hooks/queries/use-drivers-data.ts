import { useQuery } from "@tanstack/react-query";

import { fetchDrivers } from "@/api/driver";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

// size: 백엔드 take 로 전달. 이름 enrich 용도 등 첫 페이지보다 많이 필요하면 키운다.
export function useDriversData(page: number = 1, size: number = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.driver.list({ page, size }),
    queryFn: () => fetchDrivers({ page, size }),
  });
}
