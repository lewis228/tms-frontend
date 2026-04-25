import api from "@/lib/axios";
import type { TeamMemberEntity } from "@/types";

export async function fetchTeamMembers(teamId: number) {
  const { data } = await api.get<TeamMemberEntity[]>(
    `/team/${teamId}/members`,
  );
  return data;
}

export async function inviteTeamMember({
  teamId,
  email,
  permissionGroupId,
}: {
  teamId: number;
  email: string;
  permissionGroupId?: number | null;
}) {
  const { data } = await api.post<TeamMemberEntity>(
    `/team/${teamId}/members`,
    {
      email,
      permission_group_id: permissionGroupId ?? null,
    },
  );
  return data;
}

export async function removeTeamMember({
  teamId,
  userId,
}: {
  teamId: number;
  userId: number;
}) {
  await api.delete(`/team/${teamId}/members/${userId}`);
  // Echo ids back so mutation hooks can surgically patch the list cache.
  return { team_id: teamId, user_id: userId };
}
