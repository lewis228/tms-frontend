import { useQuery } from "@tanstack/react-query";

import { listTeams } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";

export function useTeamsData() {
  return useQuery({
    queryKey: QUERY_KEYS.team.list,
    queryFn: listTeams,
  });
}
