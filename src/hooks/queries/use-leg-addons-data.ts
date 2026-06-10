import { useQuery } from "@tanstack/react-query";

import { fetchLegAddons } from "@/api/leg-addon";
import { QUERY_KEYS } from "@/lib/constants";

export function useLegAddonsData(legId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.legAddon.byLeg(legId ?? 0),
    queryFn: () => fetchLegAddons(legId!),
    enabled: legId != null,
  });
}
