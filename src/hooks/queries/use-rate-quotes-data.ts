import { useQuery } from "@tanstack/react-query";

import { fetchRateQuotes } from "@/api/rate-quote";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useRateQuotesData(page: number = 1, size: number = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.rateQuote.list({ page, size }),
    queryFn: () => fetchRateQuotes({ page, size }),
  });
}
