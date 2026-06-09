// /api/v1/vessels/* 매핑.
import api from "@/lib/axios";
import type { PagedResponse, VesselEntity } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchVessels(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<VesselEntity>> {
  const { data } = await api.get<CursorResponse<VesselEntity>>("/vessels", {
    params,
  });
  return adaptCursorToPaged(data, params?.page, params?.size);
}

export async function fetchVessel(id: number): Promise<VesselEntity> {
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
  id: number,
  payload: Partial<{
    name: string;
    imoNumber: string | null;
    line: string | null;
    isActive: boolean;
    note: string | null;
  }>,
): Promise<VesselEntity> {
  const { data } = await api.put<VesselEntity>(`/vessels/${id}`, payload);
  return data;
}

export async function deleteVessel(id: number): Promise<void> {
  await api.delete(`/vessels/${id}`);
}
