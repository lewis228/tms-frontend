import { useQuery } from "@tanstack/react-query";

import { fetchDrivers } from "@/api/driver";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useDriversData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.driver.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchDrivers({ page, size: PAGE_SIZE }),
  });
}
