import { useQuery } from "@tanstack/react-query";

import { fetchLegStopsByLeg } from "@/api/leg-stop";
import { QUERY_KEYS } from "@/lib/constants";

export function useLegStopsByLegData(legId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.legStop.byLeg(legId ?? -1),
    queryFn: () => fetchLegStopsByLeg(legId!),
    enabled: !!legId,
  });
}
