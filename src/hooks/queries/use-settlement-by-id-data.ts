import { useQuery } from "@tanstack/react-query";

import { fetchSettlement } from "@/api/settlement";
import { QUERY_KEYS } from "@/lib/constants";

export function useSettlementByIdData(id: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.settlement.byId(id ?? -1),
    queryFn: () => fetchSettlement(id!),
    enabled: !!id,
  });
}
