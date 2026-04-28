import { useQuery } from "@tanstack/react-query";

import { fetchStreetTurnCandidates } from "@/api/street-turn";
import { QUERY_KEYS } from "@/lib/constants";

export function useStreetTurnCandidatesData(limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.streetTurn.candidates(limit),
    queryFn: () => fetchStreetTurnCandidates(limit),
  });
}
