// /api/v1/legs/{leg_id}/rate + /api/v1/rate/calculate
import api from "@/lib/axios";
import type { LegRateEntity, RateCalculateResult } from "@/types";

export async function fetchLegRate(legId: number): Promise<LegRateEntity> {
  const { data } = await api.get<LegRateEntity>(`/legs/${legId}/rate`);
  return data;
}

export type LegRateUpdatePayload = {
  baseAmount?: string | number | null;
  payeeDriverId?: number | null;
  note?: string | null;
};

export async function updateLegRate(
  legId: number,
  payload: LegRateUpdatePayload,
): Promise<LegRateEntity> {
  const { data } = await api.patch<LegRateEntity>(
    `/legs/${legId}/rate`,
    payload,
  );
  return data;
}

export async function recalculateLegRate(
  legId: number,
): Promise<LegRateEntity> {
  const { data } = await api.post<LegRateEntity>(
    `/legs/${legId}/rate/recalculate`,
  );
  return data;
}

export type RateCalculatePayload = {
  legId?: number | null;
  originLocationId?: number | null;
  destinationLocationId?: number | null;
  containerSize?: string | null;
  moveType?: string | null;
  customerId?: number | null;
};

export async function calculateRate(
  payload: RateCalculatePayload,
): Promise<RateCalculateResult> {
  const { data } = await api.post<RateCalculateResult>(
    "/rate/calculate",
    payload,
  );
  return data;
}
