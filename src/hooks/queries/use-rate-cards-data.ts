import { useQuery } from "@tanstack/react-query";

import { fetchRateCards } from "@/api/rate-card";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useRateCardsData(page = 1, size = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.rateCard.list({ page, size }),
    queryFn: () => fetchRateCards({ page, size }),
  });
}
