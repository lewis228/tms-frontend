import { useQuery } from "@tanstack/react-query";

import { fetchSettlementExtras } from "@/api/settlement";
import { QUERY_KEYS } from "@/lib/constants";

export function useSettlementExtrasData(id: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.settlement.extras(id ?? -1),
    queryFn: () => fetchSettlementExtras(id!),
    enabled: !!id,
  });
}
