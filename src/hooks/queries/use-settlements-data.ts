import { useQuery } from "@tanstack/react-query";

import { fetchSettlements } from "@/api/settlement";
import { QUERY_KEYS } from "@/lib/constants";

export function useSettlementsData(page: number = 1, size: number = 100) {
  return useQuery({
    queryKey: QUERY_KEYS.settlement.list({ page, size }),
    queryFn: () => fetchSettlements({ page, size }),
  });
}
