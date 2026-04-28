import { useQuery } from "@tanstack/react-query";

import { fetchChargeCodes } from "@/api/charge-code";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useChargeCodesData(page = 1, size = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.chargeCode.list({ page, size }),
    queryFn: () => fetchChargeCodes({ page, size }),
  });
}
