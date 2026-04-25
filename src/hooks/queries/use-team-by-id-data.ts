import { fetchTeamById } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useTeamByIdData(teamId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.team.byId(teamId ?? 0),
    queryFn: () => fetchTeamById(teamId!),
    enabled: !!teamId,
  });
}
