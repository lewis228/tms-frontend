// /api/v1/locations/* 매핑.
import api from "@/lib/axios";
import type { LocationEntity, LocationKind, PagedResponse } from "@/types";

export async function fetchLocations(
  params: { page?: number; size?: number } = {},
): Promise<PagedResponse<LocationEntity>> {
  const { data } = await api.get<PagedResponse<LocationEntity>>("/locations", {
    params,
  });
  return data;
}

export async function fetchLocation(id: string): Promise<LocationEntity> {
  const { data } = await api.get<LocationEntity>(`/locations/${id}`);
  return data;
}

export async function createLocation(payload: {
  name: string;
  kind: LocationKind;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  customerId?: string | null;
  note?: string | null;
}): Promise<LocationEntity> {
  const { data } = await api.post<LocationEntity>("/locations", payload);
  return data;
}

export async function updateLocation(
  id: string,
  payload: Partial<{
    name: string;
    kind: LocationKind;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    customerId: string | null;
    isActive: boolean;
    note: string | null;
  }>,
): Promise<LocationEntity> {
  const { data } = await api.patch<LocationEntity>(`/locations/${id}`, payload);
  return data;
}

export async function deleteLocation(id: string): Promise<void> {
  await api.delete(`/locations/${id}`);
}
