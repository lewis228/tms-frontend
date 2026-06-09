import { useQuery } from "@tanstack/react-query";

import { fetchRateSheetHistory } from "@/api/rate-sheet";
import { QUERY_KEYS } from "@/lib/constants";

export function useRateSheetHistoryData(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.rateSheet.history(id ?? 0),
    queryFn: () => fetchRateSheetHistory(id!),
    enabled: id != null,
  });
}
