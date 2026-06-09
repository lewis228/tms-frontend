// /api/v1/rate-sheets/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
// 요율 매트릭스 슬롯(sheet) + 셀(entry) + 변경 이력 + lookup.
// Decimal 필드(amount/perUnit)는 문자열로 직렬화한다.
import api from "@/lib/axios";
import type {
  PagedResponse,
  RateContainerSize,
  RateEntryEntity,
  RateEntryHistoryEntity,
  RateLookupResult,
  RateMoveType,
  RateSheetEntity,
  SheetKind,
} from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchRateSheets(
  params: {
    page?: number;
    size?: number;
    rateGroupId?: number;
    kind?: SheetKind;
    moveType?: RateMoveType;
    rowPointId?: number;
  } = {},
): Promise<PagedResponse<RateSheetEntity>> {
  const { data } = await api.get<CursorResponse<RateSheetEntity>>(
    "/rate-sheets",
    { params },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchRateSheet(id: number): Promise<RateSheetEntity> {
  const { data } = await api.get<RateSheetEntity>(`/rate-sheets/${id}`);
  return data;
}

export async function createRateSheet(payload: {
  rateGroupId: number;
  kind: SheetKind;
  moveType?: RateMoveType | null;
  rowPointId?: number | null;
  note?: string | null;
}): Promise<RateSheetEntity> {
  const { data } = await api.post<RateSheetEntity>("/rate-sheets", payload);
  return data;
}

export async function updateRateSheet(
  id: number,
  payload: { note?: string | null },
): Promise<RateSheetEntity> {
  const { data } = await api.put<RateSheetEntity>(`/rate-sheets/${id}`, payload);
  return data;
}

export async function deleteRateSheet(id: number): Promise<void> {
  await api.delete(`/rate-sheets/${id}`);
}

export async function fetchRateEntries(
  id: number,
): Promise<RateEntryEntity[]> {
  const { data } = await api.get<RateEntryEntity[]>(`/rate-sheets/${id}/entries`);
  return data;
}

export type SetRateEntryPayload = {
  colZoneId?: number | null;
  colPointId?: number | null;
  colCity?: string | null;
  colState?: string | null;
  containerSize?: RateContainerSize | null;
  amount?: string | null;
  perUnit?: string | null;
  effectiveFrom: string;
  reason?: string | null;
};

export async function setRateEntry(
  id: number,
  payload: SetRateEntryPayload,
): Promise<RateEntryEntity> {
  const { data } = await api.post<RateEntryEntity>(
    `/rate-sheets/${id}/entries`,
    payload,
  );
  return data;
}

export async function fetchRateSheetHistory(
  id: number,
): Promise<RateEntryHistoryEntity[]> {
  const { data } = await api.get<RateEntryHistoryEntity[]>(
    `/rate-sheets/${id}/history`,
  );
  return data;
}

export async function lookupRateEntry(
  id: number,
  params: {
    workDate: string;
    colZoneId?: number;
    colPointId?: number;
    colCity?: string;
    colState?: string;
    containerSize?: RateContainerSize;
  },
): Promise<RateLookupResult> {
  const { data } = await api.get<RateLookupResult>(
    `/rate-sheets/${id}/lookup`,
    { params },
  );
  return data;
}
