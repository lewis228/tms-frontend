// /api/v1/settlements/* 매핑.
//
// 라이프사이클 PENDING → CALCULATED → ADJUSTED → APPROVED. Unapprove 는 ADMIN+.
// 모든 상태 전이는 백엔드 가 SettlementAuditLog 1행씩 자동 기록.
//
// SettlementEntity 는 다른 도메인과 일관성 위해 types.ts 에서 정의 + 여기서 re-export.
import api from "@/lib/axios";
import type {
  ExtraChargeEntity,
  PagedResponse,
  SettlementAuditLog,
  SettlementEntity,
} from "@/types";

export type { SettlementEntity } from "@/types";

export type ExtraChargeInput = {
  type: string;
  amount: string;
  description?: string | null;
};

export type SettlementCalculatePayload = {
  systemTotal: string;
  extraCharges: ExtraChargeInput[];
};

export type SettlementAdjustPayload = {
  finalAmount?: string | null;
  driverReportedAmount?: string | null;
  hasFlag?: boolean | null;
  note: string;
  extraCharges?: ExtraChargeInput[] | null;
};

export type SettlementApprovePayload = {
  finalAmount?: string | null;
  note?: string | null;
};

export type SettlementUnapprovePayload = {
  reason: string;
};

export async function fetchSettlements(
  params: { page?: number; size?: number } = {},
): Promise<PagedResponse<SettlementEntity>> {
  const { data } = await api.get<PagedResponse<SettlementEntity>>(
    "/settlements",
    { params },
  );
  return data;
}

export async function fetchSettlement(id: number): Promise<SettlementEntity> {
  const { data } = await api.get<SettlementEntity>(`/settlements/${id}`);
  return data;
}

export async function fetchSettlementExtras(
  id: number,
): Promise<ExtraChargeEntity[]> {
  const { data } = await api.get<ExtraChargeEntity[]>(
    `/settlements/${id}/extras`,
  );
  return data;
}

export async function fetchSettlementAuditLogs(
  id: number,
): Promise<SettlementAuditLog[]> {
  const { data } = await api.get<SettlementAuditLog[]>(
    `/settlements/${id}/audit-logs`,
  );
  return data;
}

export async function calculateSettlement(
  id: number,
  payload: SettlementCalculatePayload,
): Promise<SettlementEntity> {
  const { data } = await api.post<SettlementEntity>(
    `/settlements/${id}/calculate`,
    payload,
  );
  return data;
}

export async function adjustSettlement(
  id: number,
  payload: SettlementAdjustPayload,
): Promise<SettlementEntity> {
  const { data } = await api.post<SettlementEntity>(
    `/settlements/${id}/adjust`,
    payload,
  );
  return data;
}

export async function approveSettlement(
  id: number,
  payload: SettlementApprovePayload,
): Promise<SettlementEntity> {
  const { data } = await api.post<SettlementEntity>(
    `/settlements/${id}/approve`,
    payload,
  );
  return data;
}

export async function unapproveSettlement(
  id: number,
  payload: SettlementUnapprovePayload,
): Promise<SettlementEntity> {
  const { data } = await api.post<SettlementEntity>(
    `/settlements/${id}/unapprove`,
    payload,
  );
  return data;
}
