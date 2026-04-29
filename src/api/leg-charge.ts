// /api/v1/leg-charges/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  ChargeSource,
  ChargeUnit,
  LegChargeEntity,
  PagedResponse,
  PartyKind,
} from "@/types";

export type LegChargeCreatePayload = {
  legId: number;
  chargeCodeId: number;
  rateCardId?: number | null;
  // v3: amount 미입력 시 백엔드가 quantity × snapshot_unit_amount 자동 계산
  amount?: string | number | null;
  snapshotUnitAmount?: string | number | null;
  quantity?: string | number | null;
  unit?: ChargeUnit | null;
  source?: ChargeSource;
  description?: string | null;
  payeeKind?: PartyKind | null;
  payeePartnerId?: number | null;
  payeeDriverId?: number | null;
  payeePoolId?: number | null;
  payerKind?: PartyKind | null;
  payerPartnerId?: number | null;
};

export type LegChargeUpdatePayload = Partial<
  Omit<LegChargeCreatePayload, "legId">
>;

export async function fetchLegCharges(
  params: { page?: number; size?: number; legId?: number } = {},
): Promise<PagedResponse<LegChargeEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.legId !== undefined)
    queryParams["where__leg_id__equal"] = params.legId;
  const { data } = await api.get<CursorResponse<LegChargeEntity>>(
    "/leg-charges",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchLegChargesByLeg(
  legId: number,
): Promise<LegChargeEntity[]> {
  const { data } = await api.get<LegChargeEntity[]>(
    `/leg-charges/by-leg/${legId}`,
  );
  return data;
}

export async function createLegCharge(
  payload: LegChargeCreatePayload,
): Promise<LegChargeEntity> {
  const { data } = await api.post<LegChargeEntity>("/leg-charges", payload);
  return data;
}

export async function updateLegCharge(
  id: number,
  payload: LegChargeUpdatePayload,
): Promise<LegChargeEntity> {
  const { data } = await api.patch<LegChargeEntity>(
    `/leg-charges/${id}`,
    payload,
  );
  return data;
}

export async function deleteLegCharge(id: number): Promise<void> {
  await api.delete(`/leg-charges/${id}`);
}

// H-7: 자동 매칭 트리거 (rate_card → BASE_LINEHAUL + chassis_event → CHASSIS_PER_DIEM
// + leg_stop WAIT → WAIT_PER_MIN). 이미 AUTO 가 있으면 skip (idempotent).
export async function autoMatchLegCharges(
  legId: number,
): Promise<LegChargeEntity[]> {
  const { data } = await api.post<LegChargeEntity[]>(
    `/leg-charges/auto-match/${legId}`,
  );
  return data;
}
