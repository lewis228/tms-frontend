import { useQuery } from "@tanstack/react-query";

import { fetchRateMultipliers } from "@/api/rate-multiplier";
import { QUERY_KEYS } from "@/lib/constants";

// rate-multiplier 는 plain array (비페이지네이션) — 일반 useQuery.
// rateGroupId 로 scope 필터 (null = 전역만 + 해당 그룹 override 포함은 백엔드가 결정).
export function useRateMultipliersData(rateGroupId: number | null = null) {
  return useQuery({
    queryKey: QUERY_KEYS.rateMultiplier.list({ rateGroupId }),
    queryFn: () => fetchRateMultipliers({ rateGroupId }),
  });
}
