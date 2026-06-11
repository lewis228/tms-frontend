import { useQuery } from "@tanstack/react-query";

import { searchCities } from "@/api/zip-code";
import { QUERY_KEYS } from "@/lib/constants";

// zip 마스터 도시 자동완성 — q 1자 이상일 때만 조회. state 로 필터.
// scope=true 면 팀 영업권역 내로 제한 (요율 컨텍스트 전용).
export function useCitySuggestionsData(
  q: string,
  state?: string,
  scope?: boolean
) {
  return useQuery({
    queryKey: QUERY_KEYS.zipCode.cities(q, state, scope),
    queryFn: () => searchCities(q, state, scope),
    enabled: q.trim().length >= 1,
  });
}
