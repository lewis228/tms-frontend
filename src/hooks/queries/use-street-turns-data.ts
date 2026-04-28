import { useQuery } from "@tanstack/react-query";

import { fetchStreetTurns } from "@/api/street-turn";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";
import type { StreetTurnStatus } from "@/types";

export function useStreetTurnsData(
  page = 1,
  size = PAGE_SIZE,
  status?: StreetTurnStatus,
) {
  return useQuery({
    queryKey: QUERY_KEYS.streetTurn.list({ page, size, status }),
    queryFn: () => fetchStreetTurns({ page, size, status }),
  });
}
