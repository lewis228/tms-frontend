// /api/v1/rate-cards/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  ChargeUnit,
  ContainerSize,
  PagedResponse,
  RateCardEntity,
} from "@/types";

export type RateCardCreatePayload = {
  chargeCodeId: number;
  name?: string | null;
  scopeCustomerId?: number | null;
  scopeTerminalId?: number | null;
  scopeSize?: ContainerSize | null;
  scopeZone?: string | null;
  scopeFromLocationId?: number | null;
  scopeToLocationId?: number | null;
  unit?: ChargeUnit;
  amount?: string | number | null;
  percent?: string | number | null;
  perUnit?: string | number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority?: number;
  description?: string | null;
};

export type RateCardUpdatePayload = Partial<RateCardCreatePayload>;

export async function fetchRateCards(
  params: {
    page?: number;
    size?: number;
    chargeCodeId?: number;
    customerId?: number;
    terminalId?: number;
  } = {},
): Promise<PagedResponse<RateCardEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.chargeCodeId !== undefined)
    queryParams["where__charge_code_id__equal"] = params.chargeCodeId;
  if (params.customerId !== undefined)
    queryParams["where__scope_customer_id__equal"] = params.customerId;
  if (params.terminalId !== undefined)
    queryParams["where__scope_terminal_id__equal"] = params.terminalId;
  const { data } = await api.get<CursorResponse<RateCardEntity>>(
    "/rate-cards",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchRateCard(id: number): Promise<RateCardEntity> {
  const { data } = await api.get<RateCardEntity>(`/rate-cards/${id}`);
  return data;
}

export async function createRateCard(
  payload: RateCardCreatePayload,
): Promise<RateCardEntity> {
  const { data } = await api.post<RateCardEntity>("/rate-cards", payload);
  return data;
}

export async function updateRateCard(
  id: number,
  payload: RateCardUpdatePayload,
): Promise<RateCardEntity> {
  const { data } = await api.patch<RateCardEntity>(
    `/rate-cards/${id}`,
    payload,
  );
  return data;
}

export async function deleteRateCard(id: number): Promise<void> {
  await api.delete(`/rate-cards/${id}`);
}
