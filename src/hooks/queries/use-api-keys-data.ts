import { useQuery } from "@tanstack/react-query";

import { fetchApiKeys } from "@/api/api-key";
import { QUERY_KEYS } from "@/lib/constants";

// API key 는 team 스코프지만 X-Team-Id 헤더가 axios 인터셉터에서
// 자동 첨부되므로 호출부는 teamId 를 직접 넘기지 않는다. 다만 teamId
// 가 아직 결정 안 된 경우(부트스트랩 중) 에는 query 를 비활성화한다.
export function useApiKeysData(teamId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.apiKey.list,
    queryFn: fetchApiKeys,
    enabled: !!teamId,
  });
}
