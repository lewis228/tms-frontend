import api from "@/lib/axios";
import type { TagEntity } from "@/types";

// All endpoints are team-scoped via the X-Team-Id header / API Key team_id,
// so the URL itself carries no team segment. The backend enforces the scope
// and 400s if it's missing.

export async function fetchTags() {
  const { data } = await api.get<TagEntity[]>("/tags");
  return data;
}

export async function createTag({
  name,
  color,
}: {
  name: string;
  color?: string | null;
}) {
  const { data } = await api.post<TagEntity>("/tags", { name, color });
  return data;
}

export async function updateTag({
  tagId,
  name,
  color,
}: {
  tagId: string;
  name?: string;
  color?: string | null;
}) {
  const { data } = await api.patch<TagEntity>(`/tags/${tagId}`, {
    name,
    color,
  });
  return data;
}

export async function deleteTag(tagId: string) {
  await api.delete(`/tags/${tagId}`);
  // Echo the id back so mutation hooks can target cache entries without
  // refetching — the server returns 204 No Content.
  return { id: tagId };
}
