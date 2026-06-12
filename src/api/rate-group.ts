// /api/v1/rate-groups/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
import api from "@/lib/axios";
import type {
  PagedResponse,
  RateGroupEntity,
  RateMethod,
  RateGroupEntries,
  FlatRateEntry,
  FlatRateEntryInput,
} from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchRateGroups(
  params: {
    page?: number;
    size?: number;
    q?: string;
    method?: RateMethod;
  } = {}
): Promise<PagedResponse<RateGroupEntity>> {
  // 백엔드 cursor pagination 은 take 만 인식 (page/size 무시), q → where__name__i_like,
  // method → where__method__equal (서버 필터 — 클라이언트 filter 로 take budget 낭비 금지).
  const queryParams: Record<string, unknown> = { take: params.size ?? 100 };
  if (params.q) queryParams["where__name__i_like"] = params.q;
  if (params.method) queryParams["where__method__equal"] = params.method;
  const { data } = await api.get<CursorResponse<RateGroupEntity>>(
    "/rate-groups",
    { params: queryParams }
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchRateGroup(id: number): Promise<RateGroupEntity> {
  const { data } = await api.get<RateGroupEntity>(`/rate-groups/${id}`);
  return data;
}

export async function createRateGroup(payload: {
  name: string;
  method: RateMethod;
  isDefault?: boolean;
  inheritsDefault?: boolean;
  isTemplate?: boolean;
  description?: string | null;
}): Promise<RateGroupEntity> {
  const { data } = await api.post<RateGroupEntity>("/rate-groups", payload);
  return data;
}

export async function updateRateGroup(
  id: number,
  payload: Partial<{
    name: string;
    method: RateMethod;
    isDefault: boolean;
    inheritsDefault: boolean;
    isTemplate: boolean;
    description: string | null;
  }>
): Promise<RateGroupEntity> {
  const { data } = await api.put<RateGroupEntity>(
    `/rate-groups/${id}`,
    payload
  );
  return data;
}

export async function deleteRateGroup(id: number): Promise<void> {
  await api.delete(`/rate-groups/${id}`);
}

// ── 그룹 단위 플랫 행(리스트 뷰 + 매트릭스 피벗 공용) ──────────────
export async function fetchRateGroupEntries(
  id: number
): Promise<RateGroupEntries> {
  const { data } = await api.get<RateGroupEntries>(
    `/rate-groups/${id}/entries`
  );
  return data;
}

export async function setRateGroupEntry(
  id: number,
  payload: FlatRateEntryInput
): Promise<FlatRateEntry> {
  const { data } = await api.post<FlatRateEntry>(
    `/rate-groups/${id}/entries`,
    payload
  );
  return data;
}

export async function setRateGroupEntriesBulk(
  id: number,
  items: FlatRateEntryInput[]
): Promise<FlatRateEntry[]> {
  const { data } = await api.post<FlatRateEntry[]>(
    `/rate-groups/${id}/entries/bulk`,
    { items }
  );
  return data;
}

// 그룹 플랫 행 CSV export (현재 유효 셀 → 플랫 행 CSV 텍스트).
export async function exportRateGroupEntriesCsv(id: number): Promise<string> {
  const { data } = await api.get<string>(
    `/rate-import/groups/${id}/entries.csv`,
    { responseType: "text" }
  );
  return data;
}

// 그룹 플랫 행 CSV import (rate-import 도메인 — move/service 컬럼 포함).
export async function importRateGroupEntriesCsv(
  id: number,
  csv: string,
  dryRun = false
): Promise<{ ok: boolean; total: number; applied: number; dryRun: boolean }> {
  const { data } = await api.post<{
    ok: boolean;
    total: number;
    applied: number;
    dryRun: boolean;
  }>(`/rate-import/groups/${id}/entries`, { csv, dryRun });
  return data;
}
