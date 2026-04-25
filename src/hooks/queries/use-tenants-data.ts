import { useQuery } from "@tanstack/react-query";

import { listTenants } from "@/api/tenant";
import { QUERY_KEYS } from "@/lib/constants";

export function useTenantsData() {
  return useQuery({
    queryKey: QUERY_KEYS.tenant.list,
    queryFn: listTenants,
  });
}
