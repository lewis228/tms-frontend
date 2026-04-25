import { useQuery } from "@tanstack/react-query";

import { fetchTerminals } from "@/api/terminal";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useTerminalsData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.terminal.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchTerminals({ page, size: PAGE_SIZE }),
  });
}
