// /api/v1/street-turns/* 매핑 (H-8: 승인 워크플로우 포함).
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  PagedResponse,
  StreetTurnEntity,
  StreetTurnLinkType,
  StreetTurnStatus,
} from "@/types";

export type StreetTurnCreatePayload = {
  importOrderId: number;
  exportOrderId: number;
  containerId?: number | null;
  containerNumber?: string | null;
  linkType?: StreetTurnLinkType;
};

export type StreetTurnUpdatePayload = Partial<StreetTurnCreatePayload>;

export async function fetchStreetTurns(
  params: {
    page?: number;
    size?: number;
    status?: StreetTurnStatus;
  } = {},
): Promise<PagedResponse<StreetTurnEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
    order__updated_at: "desc",
  };
  if (params.status) queryParams["where__status__equal"] = params.status;
  const { data } = await api.get<CursorResponse<StreetTurnEntity>>(
    "/street-turns",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function createStreetTurn(
  payload: StreetTurnCreatePayload,
): Promise<StreetTurnEntity> {
  const { data } = await api.post<StreetTurnEntity>("/street-turns", payload);
  return data;
}

export async function approveStreetTurn({
  id,
  carrierApprovalNo,
}: {
  id: number;
  carrierApprovalNo?: string | null;
}): Promise<StreetTurnEntity> {
  const { data } = await api.post<StreetTurnEntity>(
    `/street-turns/${id}/approve`,
    { carrierApprovalNo: carrierApprovalNo ?? null },
  );
  return data;
}

export async function rejectStreetTurn({
  id,
  reason,
}: {
  id: number;
  reason: string;
}): Promise<StreetTurnEntity> {
  const { data } = await api.post<StreetTurnEntity>(
    `/street-turns/${id}/reject`,
    { reason },
  );
  return data;
}

export async function cancelStreetTurn(id: number): Promise<StreetTurnEntity> {
  const { data } = await api.post<StreetTurnEntity>(
    `/street-turns/${id}/cancel`,
  );
  return data;
}

export async function deleteStreetTurn(id: number): Promise<void> {
  await api.delete(`/street-turns/${id}`);
}
