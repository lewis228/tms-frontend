import { useQuery } from "@tanstack/react-query";

import { fetchRateSheet } from "@/api/rate-sheet";
import { QUERY_KEYS } from "@/lib/constants";

export function useRateSheetByIdData(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.rateSheet.byId(id ?? 0),
    queryFn: () => fetchRateSheet(id!),
    enabled: id != null,
  });
}
