import { useQuery } from "@tanstack/react-query";

import { fetchVessels } from "@/api/vessel";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";

export function useVesselsData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.vessel.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchVessels({ page, size: PAGE_SIZE }),
  });
}
