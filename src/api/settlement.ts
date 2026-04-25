// /api/v1/settlements/* 매핑 — Phase 7 dashboard 집계 용도. 본격 mutation 은 Phase 8.
import api from "@/lib/axios";
import type { PagedResponse, SettlementStatus } from "@/types";

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

export async function fetchSettlements(
  params: { page?: number; size?: number } = {},
): Promise<PagedResponse<SettlementEntity>> {
  const { data } = await api.get<PagedResponse<SettlementEntity>>(
    "/settlements",
    { params },
  );
  return data;
}
