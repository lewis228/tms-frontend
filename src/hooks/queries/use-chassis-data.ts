import { useQuery } from "@tanstack/react-query";

import { fetchChassis } from "@/api/chassis";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useChassisData(page = 1, size = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.chassis.list({ page, size }),
    queryFn: () => fetchChassis({ page, size }),
  });
}
