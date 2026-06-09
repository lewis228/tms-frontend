// /api/v1/dual-transactions/* 매핑 (반납 + 픽업 1 드라이버 묶음).
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  DualTransaction,
  DualTransactionEntity,
  DualTransactionStatus,
  PagedResponse,
} from "@/types";

export type DualTransactionCreatePayload = {
  driverId: number;
  returnLegId: number;
  pickupLegId: number;
  truckId?: number | null;
  scheduledAt?: string | null;
  note?: string | null;
};

export type DualTransactionUpdatePayload = {
  truckId?: number | null;
  scheduledAt?: string | null;
  note?: string | null;
};

export async function fetchDualTransactions(
  params: {
    page?: number;
    size?: number;
    driverId?: number;
    status?: DualTransactionStatus;
  } = {},
): Promise<PagedResponse<DualTransaction>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
    driverId: params.driverId,
    status: params.status,
  };
  const { data } = await api.get<CursorResponse<DualTransaction>>(
    "/dual-transactions",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchDualTransaction(
  id: number,
): Promise<DualTransactionEntity> {
  const { data } = await api.get<DualTransactionEntity>(
    `/dual-transactions/${id}`,
  );
  return data;
}

export async function createDualTransaction(
  payload: DualTransactionCreatePayload,
): Promise<DualTransactionEntity> {
  const { data } = await api.post<DualTransactionEntity>(
    "/dual-transactions",
    payload,
  );
  return data;
}

export async function updateDualTransaction({
  id,
  payload,
}: {
  id: number;
  payload: DualTransactionUpdatePayload;
}): Promise<DualTransactionEntity> {
  const { data } = await api.patch<DualTransactionEntity>(
    `/dual-transactions/${id}`,
    payload,
  );
  return data;
}

export async function completeDualTransaction(
  id: number,
): Promise<DualTransactionEntity> {
  const { data } = await api.post<DualTransactionEntity>(
    `/dual-transactions/${id}/complete`,
  );
  return data;
}

export async function cancelDualTransaction(
  id: number,
): Promise<DualTransactionEntity> {
  const { data } = await api.post<DualTransactionEntity>(
    `/dual-transactions/${id}/cancel`,
  );
  return data;
}

export async function deleteDualTransaction(id: number): Promise<void> {
  await api.delete(`/dual-transactions/${id}`);
}
