// /api/v1/delivery-orders/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  ContainerSize,
  DeliveryOrderEntity,
  DeliveryStatus,
  PagedResponse,
  ShipmentDirection,
} from "@/types";

export type DeliveryOrderCreatePayload = {
  direction: ShipmentDirection;
  customerId: number;
  blNumber?: string | null;
  bookingNumber?: string | null;
  reference?: string | null;
  containerNumber?: string | null;
  containerSize?: ContainerSize | null;
  containerType?: string | null;
  chassisNumber?: string | null;
  terminalId?: number | null;
  vesselId?: number | null;
  deliveryLocationId?: number | null;
  returnLocationId?: number | null;
  eta?: string | null;
  pickupAppointment?: string | null;
  deliveryAppointment?: string | null;
  returnAppointment?: string | null;
  demurrageLfd?: string | null;
  detentionLfd?: string | null;
  emptyDate?: string | null;
  loadedDate?: string | null;
  blReleased?: boolean;
  pierPassPaid?: boolean;
  customsCleared?: boolean;
  internalNote?: string | null;
};

export type DeliveryOrderUpdatePayload = Partial<
  Omit<DeliveryOrderCreatePayload, "direction" | "customerId">
>;

export async function fetchDeliveryOrders(
  params: { page?: number; size?: number } = {},
): Promise<PagedResponse<DeliveryOrderEntity>> {
  const { data } = await api.get<CursorResponse<DeliveryOrderEntity>>(
    "/delivery-orders",
    { params },
  );
  return adaptCursorToPaged(data, params?.page, params?.size);
}

export async function fetchDeliveryOrder(
  id: number,
): Promise<DeliveryOrderEntity> {
  const { data } = await api.get<DeliveryOrderEntity>(`/delivery-orders/${id}`);
  return data;
}

export async function createDeliveryOrder(
  payload: DeliveryOrderCreatePayload,
): Promise<DeliveryOrderEntity> {
  const { data } = await api.post<DeliveryOrderEntity>(
    "/delivery-orders",
    payload,
  );
  return data;
}

export async function updateDeliveryOrder(
  id: number,
  payload: DeliveryOrderUpdatePayload,
): Promise<DeliveryOrderEntity> {
  const { data } = await api.patch<DeliveryOrderEntity>(
    `/delivery-orders/${id}`,
    payload,
  );
  return data;
}

export async function transitionDeliveryOrder(
  id: number,
  target: DeliveryStatus,
): Promise<DeliveryOrderEntity> {
  const { data } = await api.post<DeliveryOrderEntity>(
    `/delivery-orders/${id}/transition`,
    { target },
  );
  return data;
}

export async function deleteDeliveryOrder(id: number): Promise<void> {
  await api.delete(`/delivery-orders/${id}`);
}
