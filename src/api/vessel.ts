// /api/v1/vessels/* 매핑.
import api from "@/lib/axios";
import type { PagedResponse, VesselEntity } from "@/types";

export async function fetchVessels(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<VesselEntity>> {
  const { data } = await api.get<PagedResponse<VesselEntity>>("/vessels", {
    params,
  });
  return data;
}

export async function fetchVessel(id: string): Promise<VesselEntity> {
  const { data } = await api.get<VesselEntity>(`/vessels/${id}`);
  return data;
}

export async function createVessel(payload: {
  name: string;
  imoNumber?: string | null;
  line?: string | null;
  note?: string | null;
}): Promise<VesselEntity> {
  const { data } = await api.post<VesselEntity>("/vessels", payload);
  return data;
}

export async function updateVessel(
  id: string,
  payload: Partial<{
    name: string;
    imoNumber: string | null;
    line: string | null;
    isActive: boolean;
    note: string | null;
  }>,
): Promise<VesselEntity> {
  const { data } = await api.patch<VesselEntity>(`/vessels/${id}`, payload);
  return data;
}

export async function deleteVessel(id: string): Promise<void> {
  await api.delete(`/vessels/${id}`);
}
