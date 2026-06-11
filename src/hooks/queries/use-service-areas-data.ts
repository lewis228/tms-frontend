import { useQuery } from "@tanstack/react-query";

import { fetchServiceAreas } from "@/api/service-area";
import { QUERY_KEYS } from "@/lib/constants";

// 영업권역 선언 목록 — 선언 수가 적어 take 100 한 페이지로 충분 (래퍼 고정).
export function useServiceAreasData() {
  return useQuery({
    queryKey: QUERY_KEYS.serviceArea.list,
    queryFn: () => fetchServiceAreas(),
  });
}
