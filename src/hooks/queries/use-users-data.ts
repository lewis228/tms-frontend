// SUPER_ADMIN 이 특정 team 의 users 조회 — X-Team-Id 헤더 명시.
// queryKey 에 teamId 포함해서 캐시 분리.
import { useQuery } from "@tanstack/react-query";

import { listUsers } from "@/api/user";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useUsersData(teamId: number | null, page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.user.list({ teamId, page, size: PAGE_SIZE }),
    queryFn: () => listUsers({ page, size: PAGE_SIZE }, teamId ?? undefined),
    enabled: !!teamId,
  });
}
