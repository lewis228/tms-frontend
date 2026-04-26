import { useQuery } from "@tanstack/react-query";

import { fetchLegsByDriver } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";

export function useLegsByDriverData(driverId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.leg.byDriver(driverId ?? -1),
    queryFn: () => fetchLegsByDriver(driverId!),
    enabled: !!driverId,
  });
}
