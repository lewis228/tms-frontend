import api from "@/lib/axios";
import type { TeamUsage } from "@/types";

export async function fetchTeamUsage({
  teamId,
  days,
}: {
  teamId: number;
  days: number;
}) {
  const { data } = await api.get<TeamUsage>(`/team/${teamId}/usage`, {
    params: { days },
  });
  return data;
}
