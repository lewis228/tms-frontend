// 전체 leg list — Driver Schedule (Gantt) 가 driver 별로 클라 측 그루핑.
// 백엔드에 driver filter 없으니 페이지 100 고정 가져옴.
import { useQuery } from "@tanstack/react-query";

import { fetchLegs } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";

export function useLegsData(page: number = 1, size: number = 100) {
  return useQuery({
    queryKey: QUERY_KEYS.leg.list({ page, size }),
    queryFn: () => fetchLegs({ page, size }),
  });
}
