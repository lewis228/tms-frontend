import { useQuery } from "@tanstack/react-query";

import { fetchRateZoneMembers } from "@/api/rate-zone";
import { QUERY_KEYS } from "@/lib/constants";

export function useRateZoneMembersData(zoneId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.rateZone.members(zoneId ?? 0),
    queryFn: () => fetchRateZoneMembers(zoneId!),
    enabled: zoneId != null,
  });
}
