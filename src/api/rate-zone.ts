// /api/v1/rate-zones/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
// geojson(폴리곤) 은 pass-through — 지도 에디터는 후속 phase.
import api from "@/lib/axios";
import type {
  PagedResponse,
  RateZone,
  RateZoneEntity,
  RateZoneMemberEntity,
} from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export type RateZoneMemberInput = {
  zipCode: string;
};

export async function fetchRateZones(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<RateZoneEntity>> {
  const { data } = await api.get<CursorResponse<RateZoneEntity>>("/rate-zones", {
    params,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchRateZone(id: number): Promise<RateZone> {
  const { data } = await api.get<RateZone>(`/rate-zones/${id}`);
  return data;
}

export async function createRateZone(payload: {
  name: string;
  code?: string | null;
  color?: string | null;
  geojson?: Record<string, unknown> | null;
  description?: string | null;
  members?: RateZoneMemberInput[];
}): Promise<RateZone> {
  const { data } = await api.post<RateZone>("/rate-zones", payload);
  return data;
}

export async function updateRateZone(
  id: number,
  payload: Partial<{
    name: string;
    code: string | null;
    color: string | null;
    geojson: Record<string, unknown> | null;
    description: string | null;
  }>,
): Promise<RateZone> {
  const { data } = await api.put<RateZone>(`/rate-zones/${id}`, payload);
  return data;
}

export async function deleteRateZone(id: number): Promise<void> {
  await api.delete(`/rate-zones/${id}`);
}

type MembersResponse = {
  zoneId: number;
  members: RateZoneMemberEntity[];
  count: number;
};

export async function fetchRateZoneMembers(
  id: number,
): Promise<RateZoneMemberEntity[]> {
  const { data } = await api.get<MembersResponse>(`/rate-zones/${id}/members`);
  return data.members;
}

export async function replaceRateZoneMembers(
  id: number,
  members: RateZoneMemberInput[],
): Promise<RateZoneMemberEntity[]> {
  const { data } = await api.put<MembersResponse>(`/rate-zones/${id}/members`, {
    members,
  });
  return data.members;
}
