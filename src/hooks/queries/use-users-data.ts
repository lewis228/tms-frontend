// SUPER_ADMIN 이 특정 tenant 의 users 조회 — X-Tenant-Id 헤더 명시.
// queryKey 에 tenantId 포함해서 캐시 분리.
import { useQuery } from "@tanstack/react-query";

import { listUsers } from "@/api/user";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useUsersData(tenantId: string | null, page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.user.list({ tenantId, page, size: PAGE_SIZE }),
    queryFn: () => listUsers({ page, size: PAGE_SIZE }, tenantId ?? undefined),
    enabled: !!tenantId,
  });
}
