import { useQuery } from "@tanstack/react-query";

import { fetchRateGroupEntries } from "@/api/rate-group";
import { QUERY_KEYS } from "@/lib/constants";

export function useRateGroupEntriesData(groupId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.rateGroup.entries(groupId ?? 0),
    queryFn: () => fetchRateGroupEntries(groupId!),
    enabled: !!groupId,
  });
}
