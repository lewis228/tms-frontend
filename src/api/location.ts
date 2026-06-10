// /api/v1/locations/* 매핑.
import api from "@/lib/axios";
import type { LocationEntity, LocationKind, PagedResponse } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchLocations(
  params: { page?: number; size?: number; q?: string; kind?: LocationKind } = {},
): Promise<PagedResponse<LocationEntity>> {
  const { kind, ...rest } = params;
  const { data } = await api.get<CursorResponse<LocationEntity>>("/locations", {
    // kind 필터는 백엔드 where__kind__equal 로 전달 (예: YARD 캐스케이드)
    params: { ...rest, ...(kind ? { where__kind__equal: kind } : {}) },
  });
  return adaptCursorToPaged(data, params?.page, params?.size);
}

export async function fetchLocation(id: number): Promise<LocationEntity> {
  const { data } = await api.get<LocationEntity>(`/locations/${id}`);
  return data;
}

export async function createLocation(payload: {
  name: string;
  kind: LocationKind;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  customerId?: number | null;
  note?: string | null;
}): Promise<LocationEntity> {
  const { data } = await api.post<LocationEntity>("/locations", payload);
  return data;
}

export async function updateLocation(
  id: number,
  payload: Partial<{
    name: string;
    kind: LocationKind;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    customerId: number | null;
    isActive: boolean;
    note: string | null;
  }>,
): Promise<LocationEntity> {
  const { data } = await api.put<LocationEntity>(`/locations/${id}`, payload);
  return data;
}

export async function deleteLocation(id: number): Promise<void> {
  await api.delete(`/locations/${id}`);
}
