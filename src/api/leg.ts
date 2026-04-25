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

export type LegCreatePayload = {
  deliveryOrderId: string;
  step: DeliveryStatus;
  moveType: MoveType;
  serviceType: ServiceType;
  driverId?: string | null;
  pickupLocationId?: string | null;
  pickupDate?: string | null;
  deliveryLocationId?: string | null;
  deliveryDate?: string | null;
  note?: string | null;
};

export type LegUpdatePayload = Partial<Omit<LegCreatePayload, "deliveryOrderId">>;

export async function fetchLegs(
  params: { page?: number; size?: number } = {},
): Promise<PagedResponse<LegEntity>> {
  const { data } = await api.get<PagedResponse<LegEntity>>("/legs", {
    params,
  });
  return data;
}

export async function fetchLegsByDeliveryOrder(
  deliveryOrderId: string,
): Promise<LegEntity[]> {
  const { data } = await api.get<PagedResponse<LegEntity>>("/legs", {
    params: { deliveryOrderId, page: 1, size: 100 },
  });
  return data.items;
}

export async function fetchLeg(id: string): Promise<LegEntity> {
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
  id: string,
  payload: LegUpdatePayload,
): Promise<LegEntity> {
  const { data } = await api.patch<LegEntity>(`/legs/${id}`, payload);
  return data;
}

export async function transitionLeg(
  id: string,
  target: LegStatus,
  failureReason?: string | null,
): Promise<LegEntity> {
  const { data } = await api.post<LegEntity>(`/legs/${id}/transition`, {
    target,
    failureReason: failureReason ?? null,
  });
  return data;
}

export async function deleteLeg(id: string): Promise<void> {
  await api.delete(`/legs/${id}`);
}
