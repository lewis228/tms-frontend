import { useQuery } from "@tanstack/react-query";

import { fetchSettlement } from "@/api/settlement";
import { QUERY_KEYS } from "@/lib/constants";

export function useSettlementByIdData(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.settlement.byId(id ?? ""),
    queryFn: () => fetchSettlement(id!),
    enabled: !!id,
  });
}
