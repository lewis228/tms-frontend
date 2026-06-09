// /api/v1/legs/* 매핑.
import api from "@/lib/axios";
import type {
  DeliveryStatus,
  LegEntity,
  LegStatus,
  MoveType,
  PagedResponse,
  ServiceType,
} from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export type LegCreatePayload = {
  deliveryOrderId: number;
  containerId?: number | null;
  step: DeliveryStatus;
  moveType: MoveType;
  serviceType: ServiceType;
  driverId?: number | null;
  truckId?: number | null;
  chassisId?: number | null;
  pickupLocationId?: number | null;
  pickupDate?: string | null;
  deliveryLocationId?: number | null;
  deliveryDate?: string | null;
  note?: string | null;
};

export type LegUpdatePayload = Partial<Omit<LegCreatePayload, "deliveryOrderId">>;

export async function fetchLegs(
  params: { page?: number; size?: number } = {},
): Promise<PagedResponse<LegEntity>> {
  const { data } = await api.get<CursorResponse<LegEntity>>("/legs", {
    params,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchLegsByDeliveryOrder(
  deliveryOrderId: number,
): Promise<LegEntity[]> {
  const { data } = await api.get<CursorResponse<LegEntity>>("/legs", {
    params: { deliveryOrderId, page: 1, size: 100 },
  });
  return adaptCursorToPaged(data, 1, 100).items;
}

export async function fetchLegsByDriver(
  driverId: number,
): Promise<LegEntity[]> {
  const { data } = await api.get<CursorResponse<LegEntity>>("/legs", {
    params: { driverId, page: 1, size: 100 },
  });
  return adaptCursorToPaged(data, 1, 100).items;
}

export async function fetchLeg(id: number): Promise<LegEntity> {
  const { data } = await api.get<LegEntity>(`/legs/${id}`);
  return data;
}

export async function createLeg(
  payload: LegCreatePayload,
): Promise<LegEntity> {
  const { data } = await api.post<LegEntity>("/legs", payload);
  return data;
}

export async function updateLeg(
  id: number,
  payload: LegUpdatePayload,
): Promise<LegEntity> {
  const { data } = await api.patch<LegEntity>(`/legs/${id}`, payload);
  return data;
}

export async function transitionLeg(
  id: number,
  target: LegStatus,
  failureReason?: string | null,
): Promise<LegEntity> {
  const { data } = await api.post<LegEntity>(`/legs/${id}/transition`, {
    target,
    failureReason: failureReason ?? null,
  });
  return data;
}

export async function deleteLeg(id: number): Promise<void> {
  await api.delete(`/legs/${id}`);
}

// Load Type 템플릿 → container 에 leg N개 자동 생성. 생성된 leg 배열 반환.
export async function applyLoadType({
  containerId,
  templateId,
  replaceExisting,
}: {
  containerId: number;
  templateId: number;
  replaceExisting?: boolean;
}): Promise<LegEntity[]> {
  const { data } = await api.post<LegEntity[]>("/legs/apply-load-type", {
    containerId,
    templateId,
    replaceExisting: replaceExisting ?? false,
  });
  return data;
}

// Dry Run 재발급 — 원본 leg 는 DRY_RUN 으로 종료, 동일 구간 새 PENDING leg 발급.
export async function reissueLeg(
  id: number,
  { reason }: { reason?: string | null } = {},
): Promise<LegEntity> {
  const { data } = await api.post<LegEntity>(`/legs/${id}/reissue`, {
    reason: reason ?? null,
  });
  return data;
}
