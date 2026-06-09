import { useQuery } from "@tanstack/react-query";

import { fetchRateSheets } from "@/api/rate-sheet";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useRateSheetsData(
  page: number = 1,
  rateGroupId?: number,
) {
  return useQuery({
    queryKey: QUERY_KEYS.rateSheet.list({
      page,
      size: PAGE_SIZE,
      rateGroupId,
    }),
    queryFn: () => fetchRateSheets({ page, size: PAGE_SIZE, rateGroupId }),
  });
}
