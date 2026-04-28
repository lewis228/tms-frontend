import { useQuery } from "@tanstack/react-query";

import { fetchTrucks } from "@/api/truck";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useTrucksData(page = 1, size = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.truck.list({ page, size }),
    queryFn: () => fetchTrucks({ page, size }),
  });
}
