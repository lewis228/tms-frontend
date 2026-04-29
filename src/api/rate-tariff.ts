// /api/v1/rate-tariffs/* — 거리×단가룰 마스터
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  RateTariffEntity,
  PagedResponse,
  ContainerSize,
  MoveTypeV3,
} from "@/types";

export async function fetchRateTariffs(
  params: { page?: number; size?: number; moveType?: MoveTypeV3 } = {},
): Promise<PagedResponse<RateTariffEntity>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.moveType) {
    queryParams["where__move_type__equal"] = params.moveType;
  }
  const { data } = await api.get<CursorResponse<RateTariffEntity>>(
    "/rate-tariffs",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchRateTariff(id: number): Promise<RateTariffEntity> {
  const { data } = await api.get<RateTariffEntity>(`/rate-tariffs/${id}`);
  return data;
}

export type RateTariffCreatePayload = {
  name: string;
  moveType?: MoveTypeV3 | null;
  containerSize?: ContainerSize | null;
  customerId?: number | null;
  perValue?: string | number;
  perMin?: string | number;
  flatBase?: string | number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority?: number;
  description?: string | null;
};

export async function createRateTariff(
  payload: RateTariffCreatePayload,
): Promise<RateTariffEntity> {
  const { data } = await api.post<RateTariffEntity>("/rate-tariffs", payload);
  return data;
}

export async function updateRateTariff(
  id: number,
  payload: Partial<RateTariffCreatePayload>,
): Promise<RateTariffEntity> {
  const { data } = await api.patch<RateTariffEntity>(
    `/rate-tariffs/${id}`,
    payload,
  );
  return data;
}

export async function deleteRateTariff(id: number): Promise<void> {
  await api.delete(`/rate-tariffs/${id}`);
}
