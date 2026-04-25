import { fetchTenantById } from "@/api/tenant";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useTenantByIdData(tenantId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.tenant.byId(tenantId ?? 0),
    queryFn: () => fetchTenantById(tenantId!),
    enabled: !!tenantId,
  });
}
