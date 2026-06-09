// /api/v1/terminals/* 매핑.
import api from "@/lib/axios";
import type { PagedResponse, TerminalEntity } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchTerminals(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<TerminalEntity>> {
  const { data } = await api.get<CursorResponse<TerminalEntity>>("/terminals", {
    params,
  });
  return adaptCursorToPaged(data, params?.page, params?.size);
}

export async function fetchTerminal(id: number): Promise<TerminalEntity> {
  const { data } = await api.get<TerminalEntity>(`/terminals/${id}`);
  return data;
}

export async function createTerminal(payload: {
  name: string;
  code?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  note?: string | null;
}): Promise<TerminalEntity> {
  const { data } = await api.post<TerminalEntity>("/terminals", payload);
  return data;
}

export async function updateTerminal(
  id: number,
  payload: Partial<{
    name: string;
    code: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    note: string | null;
  }>,
): Promise<TerminalEntity> {
  const { data } = await api.put<TerminalEntity>(`/terminals/${id}`, payload);
  return data;
}

export async function deleteTerminal(id: number): Promise<void> {
  await api.delete(`/terminals/${id}`);
}
