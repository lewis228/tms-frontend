// /api/v1/terminals/* 매핑.
import api from "@/lib/axios";
import type { PagedResponse, TerminalEntity } from "@/types";

export async function fetchTerminals(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<TerminalEntity>> {
  const { data } = await api.get<PagedResponse<TerminalEntity>>("/terminals", {
    params,
  });
  return data;
}

export async function fetchTerminal(id: string): Promise<TerminalEntity> {
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
  id: string,
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
  const { data } = await api.patch<TerminalEntity>(`/terminals/${id}`, payload);
  return data;
}

export async function deleteTerminal(id: string): Promise<void> {
  await api.delete(`/terminals/${id}`);
}
