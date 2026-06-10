// /api/v1/rate-points/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
// bulk 엔드포인트는 UI 미사용 — 단건 CRUD 만 래핑.
import api from "@/lib/axios";
import type { PagedResponse, RatePointType, RatePointEntity } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchRatePoints(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<RatePointEntity>> {
  const { data } = await api.get<CursorResponse<RatePointEntity>>(
    "/rate-points",
    { params },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchRatePoint(id: number): Promise<RatePointEntity> {
  const { data } = await api.get<RatePointEntity>(`/rate-points/${id}`);
  return data;
}

export async function createRatePoint(payload: {
  name: string;
  code?: string | null;
  pointType: RatePointType;
  address?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  terminalId?: number | null;
  locationId?: number | null;
  note?: string | null;
}): Promise<RatePointEntity> {
  const { data } = await api.post<RatePointEntity>("/rate-points", payload);
  return data;
}

export async function updateRatePoint(
  id: number,
  payload: Partial<{
    name: string;
    code: string | null;
    pointType: RatePointType;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    terminalId: number | null;
    locationId: number | null;
    note: string | null;
  }>,
): Promise<RatePointEntity> {
  const { data } = await api.put<RatePointEntity>(`/rate-points/${id}`, payload);
  return data;
}

export async function deleteRatePoint(id: number): Promise<void> {
  await api.delete(`/rate-points/${id}`);
}
