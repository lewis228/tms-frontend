import { useQuery } from "@tanstack/react-query";

import { fetchRateEntries } from "@/api/rate-sheet";
import { QUERY_KEYS } from "@/lib/constants";

export function useRateSheetEntriesData(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.rateSheet.entries(id ?? 0),
    queryFn: () => fetchRateEntries(id!),
    enabled: id != null,
  });
}
