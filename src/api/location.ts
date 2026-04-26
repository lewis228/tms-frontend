// /api/v1/locations/* 매핑.
import api from "@/lib/axios";
import type { LocationEntity, LocationKind, PagedResponse } from "@/types";

export async function fetchLocations(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<LocationEntity>> {
  const { data } = await api.get<PagedResponse<LocationEntity>>("/locations", {
    params,
  });
  return data;
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
  const { data } = await api.patch<LocationEntity>(`/locations/${id}`, payload);
  return data;
}

export async function deleteLocation(id: number): Promise<void> {
  await api.delete(`/locations/${id}`);
}
