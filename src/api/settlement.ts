// /api/v1/settlements/* 매핑.
//
// 라이프사이클 PENDING → CALCULATED → ADJUSTED → APPROVED. Unapprove 는 ADMIN+.
// 모든 상태 전이는 백엔드 가 SettlementAuditLog 1행씩 자동 기록.
import api from "@/lib/axios";
import type {
  ExtraChargeEntity,
  PagedResponse,
  SettlementAuditLog,
  SettlementStatus,
} from "@/types";

export type SettlementEntity = {
  id: string;
  tenantId: string;
  legId: string;
  systemTotal: string;
  driverReportedAmount: string | null;
  discrepancy: string | null;
  hasFlag: boolean;
  finalAmount: string | null;
  settlementStatus: SettlementStatus;
  isSettled: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  unapprovedAt: string | null;
  unapprovedBy: string | null;
  unapprovedReason: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

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

export async function fetchSettlement(id: string): Promise<SettlementEntity> {
  const { data } = await api.get<SettlementEntity>(`/settlements/${id}`);
  return data;
}

export async function fetchSettlementExtras(
  id: string,
): Promise<ExtraChargeEntity[]> {
  const { data } = await api.get<ExtraChargeEntity[]>(
    `/settlements/${id}/extras`,
  );
  return data;
}

export async function fetchSettlementAuditLogs(
  id: string,
): Promise<SettlementAuditLog[]> {
  const { data } = await api.get<SettlementAuditLog[]>(
    `/settlements/${id}/audit-logs`,
  );
  return data;
}

export async function calculateSettlement(
  id: string,
  payload: SettlementCalculatePayload,
): Promise<SettlementEntity> {
  const { data } = await api.post<SettlementEntity>(
    `/settlements/${id}/calculate`,
    payload,
  );
  return data;
}

export async function adjustSettlement(
  id: string,
  payload: SettlementAdjustPayload,
): Promise<SettlementEntity> {
  const { data } = await api.post<SettlementEntity>(
    `/settlements/${id}/adjust`,
    payload,
  );
  return data;
}

export async function approveSettlement(
  id: string,
  payload: SettlementApprovePayload,
): Promise<SettlementEntity> {
  const { data } = await api.post<SettlementEntity>(
    `/settlements/${id}/approve`,
    payload,
  );
  return data;
}

export async function unapproveSettlement(
  id: string,
  payload: SettlementUnapprovePayload,
): Promise<SettlementEntity> {
  const { data } = await api.post<SettlementEntity>(
    `/settlements/${id}/unapprove`,
    payload,
  );
  return data;
}
