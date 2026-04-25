import { fetchTeamMembers } from "@/api/team-member";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useTeamMembersData(teamId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.teamMember.listByTeam(teamId ?? 0),
    queryFn: () => fetchTeamMembers(teamId!),
    enabled: !!teamId,
  });
}
