import { useQuery } from "@tanstack/react-query";

import { fetchRateTariffs } from "@/api/rate-tariff";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useRateTariffsData(page: number = 1, size: number = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.rateTariff.list({ page, size }),
    queryFn: () => fetchRateTariffs({ page, size }),
  });
}
