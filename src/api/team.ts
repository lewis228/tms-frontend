import api from "@/lib/axios";
import type { TeamEntity } from "@/types";

export async function createTeam({ name }: { name: string }) {
  const { data } = await api.post<TeamEntity>("/team", { name });
  return data;
}

export async function fetchTeamById(teamId: number) {
  const { data } = await api.get<TeamEntity>(`/team/${teamId}`);
  return data;
}

// Partial update. All fields optional — omitted keys are left untouched on
// the server thanks to Pydantic's `exclude_unset` in the router.
export type UpdateTeamPayload = {
  name?: string;
  email?: string | null;
  memo?: string | null;
  timezone?: string | null;
};

export async function updateTeam({
  teamId,
  payload,
}: {
  teamId: number;
  payload: UpdateTeamPayload;
}) {
  const { data } = await api.patch<TeamEntity>(`/team/${teamId}`, payload);
  return data;
}

// Permanently deletes the team. Server cascades to shipments, events, API
// keys, and memberships. Returns the id so the caller can invalidate the
// right cache entries.
export async function deleteTeam(teamId: number) {
  await api.delete(`/team/${teamId}`);
  return { team_id: teamId };
}

