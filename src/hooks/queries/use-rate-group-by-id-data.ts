import { useQuery } from "@tanstack/react-query";

import { fetchRateGroup } from "@/api/rate-group";
import { QUERY_KEYS } from "@/lib/constants";

export function useRateGroupByIdData(id: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.rateGroup.byId(id ?? -1),
    queryFn: () => fetchRateGroup(id!),
    enabled: !!id,
  });
}
