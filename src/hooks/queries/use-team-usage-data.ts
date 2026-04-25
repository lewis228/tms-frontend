import { fetchTeamUsage } from "@/api/team-usage";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useTeamUsageData({
  teamId,
  days = 30,
}: {
  teamId: number | undefined;
  days?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.teamUsage.byTeam(teamId ?? 0, days),
    queryFn: () => fetchTeamUsage({ teamId: teamId!, days }),
    enabled: !!teamId,
  });
}
