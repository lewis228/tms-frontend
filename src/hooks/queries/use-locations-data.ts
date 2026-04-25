import { useQuery } from "@tanstack/react-query";

import { fetchLocations } from "@/api/location";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useLocationsData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.location.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchLocations({ page, size: PAGE_SIZE }),
  });
}
