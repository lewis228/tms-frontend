import { useQuery } from "@tanstack/react-query";

import { fetchDistanceMatrix } from "@/api/distance-matrix";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useDistanceMatrixData(page: number = 1, size: number = PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.distanceMatrix.list({ page, size }),
    queryFn: () => fetchDistanceMatrix({ page, size }),
  });
}
