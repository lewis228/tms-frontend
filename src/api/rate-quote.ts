// /api/v1/rate-quotes/* — 정찰가 마스터
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  RateQuoteEntity,
  PagedResponse,
  ContainerSize,
  MoveTypeV3,
} from "@/types";

export async function fetchRateQuotes(
  params: { page?: number; size?: number; customerId?: number } = {},
): Promise<PagedResponse<RateQuoteEntity>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.customerId !== undefined) {
    queryParams["where__customer_id__equal"] = params.customerId;
  }
  const { data } = await api.get<CursorResponse<RateQuoteEntity>>(
    "/rate-quotes",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchRateQuote(id: number): Promise<RateQuoteEntity> {
  const { data } = await api.get<RateQuoteEntity>(`/rate-quotes/${id}`);
  return data;
}

export type RateQuoteCreatePayload = {
  name?: string | null;
  originLocationId?: number | null;
  destinationLocationId?: number | null;
  containerSize?: ContainerSize | null;
  moveType?: MoveTypeV3 | null;
  customerId?: number | null;
  fixedAmount: string | number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority?: number;
  description?: string | null;
};

export async function createRateQuote(
  payload: RateQuoteCreatePayload,
): Promise<RateQuoteEntity> {
  const { data } = await api.post<RateQuoteEntity>("/rate-quotes", payload);
  return data;
}

export async function updateRateQuote(
  id: number,
  payload: Partial<RateQuoteCreatePayload>,
): Promise<RateQuoteEntity> {
  const { data } = await api.patch<RateQuoteEntity>(
    `/rate-quotes/${id}`,
    payload,
  );
  return data;
}

export async function deleteRateQuote(id: number): Promise<void> {
  await api.delete(`/rate-quotes/${id}`);
}
