// /api/v1/rate-groups/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
import api from "@/lib/axios";
import type { PagedResponse, RateGroupEntity, RateMethod } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchRateGroups(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<RateGroupEntity>> {
  const { data } = await api.get<CursorResponse<RateGroupEntity>>(
    "/rate-groups",
    { params },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchRateGroup(id: number): Promise<RateGroupEntity> {
  const { data } = await api.get<RateGroupEntity>(`/rate-groups/${id}`);
  return data;
}

export async function createRateGroup(payload: {
  name: string;
  method: RateMethod;
  isDefault?: boolean;
  isTemplate?: boolean;
  description?: string | null;
}): Promise<RateGroupEntity> {
  const { data } = await api.post<RateGroupEntity>("/rate-groups", payload);
  return data;
}

export async function updateRateGroup(
  id: number,
  payload: Partial<{
    name: string;
    method: RateMethod;
    isDefault: boolean;
    isTemplate: boolean;
    description: string | null;
  }>,
): Promise<RateGroupEntity> {
  const { data } = await api.put<RateGroupEntity>(`/rate-groups/${id}`, payload);
  return data;
}

export async function deleteRateGroup(id: number): Promise<void> {
  await api.delete(`/rate-groups/${id}`);
}
