// /api/v1/terminals/* 매핑.
import api from "@/lib/axios";
import type { PagedResponse, TerminalEntity } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchTerminals(
  params: { page?: number; size?: number; q?: string } = {}
): Promise<PagedResponse<TerminalEntity>> {
  // 백엔드 cursor pagination 은 take 만 인식 (page/size 는 무시됨). q → where__name__i_like.
  const queryParams: Record<string, string | number | undefined> = {
    take: params.size ?? 20,
  };
  if (params.q) queryParams["where__name__i_like"] = params.q;
  const { data } = await api.get<CursorResponse<TerminalEntity>>("/terminals", {
    params: queryParams,
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
  zipId?: number | null;
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
    zipId: number | null;
    isActive: boolean;
    note: string | null;
  }>
): Promise<TerminalEntity> {
  const { data } = await api.put<TerminalEntity>(`/terminals/${id}`, payload);
  return data;
}

export async function deleteTerminal(id: number): Promise<void> {
  await api.delete(`/terminals/${id}`);
}
