import api from "@/lib/axios";
import type { ApiKeyEntity, ApiKeyCreated } from "@/types";

export async function fetchApiKeys(teamId: number) {
  const { data } = await api.get<ApiKeyEntity[]>(`/team/${teamId}/api-keys`);
  return data;
}

export async function createApiKey({
  teamId,
  name,
  description,
  expiresInDays,
}: {
  teamId: number;
  name: string;
  description?: string | null;
  expiresInDays: number | null;
}) {
  const { data } = await api.post<ApiKeyCreated>(`/team/${teamId}/api-keys`, {
    name,
    description,
    // Server expects snake_case + null for "never expires".
    expires_in_days: expiresInDays,
  });
  return data;
}

export async function updateApiKey({
  teamId,
  apiKeyId,
  name,
  description,
}: {
  teamId: number;
  apiKeyId: number;
  name?: string;
  description?: string | null;
}) {
  const { data } = await api.patch<ApiKeyEntity>(
    `/team/${teamId}/api-keys/${apiKeyId}`,
    { name, description },
  );
  return data;
}

export async function revokeApiKey({
  teamId,
  apiKeyId,
}: {
  teamId: number;
  apiKeyId: number;
}) {
  await api.delete(`/team/${teamId}/api-keys/${apiKeyId}`);
  // Return the id so the mutation hook can update list cache without
  // re-fetching — the server returns 204 No Content.
  return { id: apiKeyId, team_id: teamId };
}
