// /api/v1/locations/* 매핑.
import api from "@/lib/axios";
import type { LocationEntity, LocationKind, PagedResponse } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchLocations(
  params: { page?: number; size?: number; q?: string; kind?: LocationKind } = {}
): Promise<PagedResponse<LocationEntity>> {
  // 백엔드 cursor pagination 은 take 만 인식 (page/size 는 무시됨). q → where__name__i_like.
  // kind 필터는 백엔드 where__kind__equal 로 전달 (예: YARD 캐스케이드)
  const queryParams: Record<string, string | number | undefined> = {
    take: params.size ?? 20,
  };
  if (params.q) queryParams["where__name__i_like"] = params.q;
  if (params.kind) queryParams["where__kind__equal"] = params.kind;
  const { data } = await api.get<CursorResponse<LocationEntity>>("/locations", {
    params: queryParams,
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
  zipId?: number | null;
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
    zipId: number | null;
    isActive: boolean;
    note: string | null;
  }>
): Promise<LocationEntity> {
  const { data } = await api.put<LocationEntity>(`/locations/${id}`, payload);
  return data;
}

export async function deleteLocation(id: number): Promise<void> {
  await api.delete(`/locations/${id}`);
}
