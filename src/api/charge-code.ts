// /api/v1/charge-codes/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  ChargeCodeEntity,
  ChargeKind,
  ChargeUnit,
  PagedResponse,
} from "@/types";

export type ChargeCodeCreatePayload = {
  code: string;
  name: string;
  kind: ChargeKind;
  defaultUnit?: ChargeUnit;
  defaultAmount?: string | number | null;
  isBillableToCustomer?: boolean;
  isPayableToDriver?: boolean;
  glAccount?: string | null;
  description?: string | null;
};

export type ChargeCodeUpdatePayload = Partial<ChargeCodeCreatePayload>;

export async function fetchChargeCodes(
  params: {
    page?: number;
    size?: number;
    code?: string;
    name?: string;
    kind?: ChargeKind;
  } = {},
): Promise<PagedResponse<ChargeCodeEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.code) queryParams["where__code__i_like"] = params.code;
  if (params.name) queryParams["where__name__i_like"] = params.name;
  if (params.kind) queryParams["where__kind__equal"] = params.kind;
  const { data } = await api.get<CursorResponse<ChargeCodeEntity>>(
    "/charge-codes",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchChargeCode(id: number): Promise<ChargeCodeEntity> {
  const { data } = await api.get<ChargeCodeEntity>(`/charge-codes/${id}`);
  return data;
}

export async function createChargeCode(
  payload: ChargeCodeCreatePayload,
): Promise<ChargeCodeEntity> {
  const { data } = await api.post<ChargeCodeEntity>("/charge-codes", payload);
  return data;
}

export async function updateChargeCode(
  id: number,
  payload: ChargeCodeUpdatePayload,
): Promise<ChargeCodeEntity> {
  const { data } = await api.patch<ChargeCodeEntity>(
    `/charge-codes/${id}`,
    payload,
  );
  return data;
}

export async function deleteChargeCode(id: number): Promise<void> {
  await api.delete(`/charge-codes/${id}`);
}
