// /api/v1/api-keys/* 매핑.
//
// tenant 스코프는 axios 의 X-Tenant-Id 헤더 인터셉터가 처리하므로 URL 에는
// tenant id 가 들어가지 않는다 (TMS ste-pattern).
import api from "@/lib/axios";
import type { ApiKeyEntity, ApiKeyCreated } from "@/types";

export async function fetchApiKeys(): Promise<ApiKeyEntity[]> {
  const { data } = await api.get<ApiKeyEntity[]>("/api-keys");
  return data;
}

export async function createApiKey(payload: {
  name: string;
  description?: string | null;
  expiresInDays: number | null;
}): Promise<ApiKeyCreated> {
  const { data } = await api.post<ApiKeyCreated>("/api-keys", {
    name: payload.name,
    description: payload.description,
    // 서버 RequestSchema 가 alias_generator=to_camel 로 camelCase 를 받음.
    // null = 무기한, ge=1, le=3650 검증.
    expiresInDays: payload.expiresInDays,
  });
  return data;
}

export async function updateApiKey({
  apiKeyId,
  name,
  description,
}: {
  apiKeyId: number;
  name?: string;
  description?: string | null;
}): Promise<ApiKeyEntity> {
  const { data } = await api.patch<ApiKeyEntity>(`/api-keys/${apiKeyId}`, {
    name,
    description,
  });
  return data;
}

export async function deleteApiKey(
  apiKeyId: number,
): Promise<{ id: number; revoked: boolean }> {
  const { data } = await api.delete<{ id: number; revoked: boolean }>(
    `/api-keys/${apiKeyId}`,
  );
  return data;
}
