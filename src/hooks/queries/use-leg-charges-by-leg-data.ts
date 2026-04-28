import { useQuery } from "@tanstack/react-query";

import { fetchLegChargesByLeg } from "@/api/leg-charge";
import { QUERY_KEYS } from "@/lib/constants";

export function useLegChargesByLegData(legId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.legCharge.byLeg(legId ?? -1),
    queryFn: () => fetchLegChargesByLeg(legId!),
    enabled: !!legId,
  });
}
