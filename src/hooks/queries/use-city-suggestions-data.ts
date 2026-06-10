import { useQuery } from "@tanstack/react-query";

import { searchCities } from "@/api/zip-code";
import { QUERY_KEYS } from "@/lib/constants";

// zip 마스터 도시 자동완성 — q 1자 이상일 때만 조회. state 로 필터.
export function useCitySuggestionsData(q: string, state?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.zipCode.cities(q, state),
    queryFn: () => searchCities(q, state),
    enabled: q.trim().length >= 1,
  });
}
