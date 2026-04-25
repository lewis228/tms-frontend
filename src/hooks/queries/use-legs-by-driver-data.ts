import { useQuery } from "@tanstack/react-query";

import { fetchLegsByDriver } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";

export function useLegsByDriverData(driverId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.leg.byDriver(driverId ?? ""),
    queryFn: () => fetchLegsByDriver(driverId!),
    enabled: !!driverId,
  });
}
