// /api/v1/delivery-orders/* 매핑.
//
// H-1 이후: D/O detail 응답에 `containers: ContainerEntity[]` nested.
// Create payload 에 containers 배열 동시 전달 가능.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type { ContainerCreateInnerPayload } from "@/api/container";
import type {
  AuditLogEntity,
  DeliveryOrderDetailEntity,
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
  terminalId?: number | null;
  vesselId?: number | null;
  eta?: string | null;
  blReleased?: boolean;
  internalNote?: string | null;
  containers?: ContainerCreateInnerPayload[];
};

export type DeliveryOrderUpdatePayload = Partial<
  Omit<DeliveryOrderCreatePayload, "direction" | "customerId" | "containers">
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
): Promise<DeliveryOrderDetailEntity> {
  const { data } = await api.get<DeliveryOrderDetailEntity>(
    `/delivery-orders/${id}`,
  );
  return data;
}

export async function createDeliveryOrder(
  payload: DeliveryOrderCreatePayload,
): Promise<DeliveryOrderDetailEntity> {
  const { data } = await api.post<DeliveryOrderDetailEntity>(
    "/delivery-orders",
    payload,
  );
  return data;
}

export async function updateDeliveryOrder(
  id: number,
  payload: DeliveryOrderUpdatePayload,
): Promise<DeliveryOrderEntity> {
  // 백엔드 D/O 라우터는 PUT /{delivery_order_id} (customer/driver 등과 동일)
  const { data } = await api.put<DeliveryOrderEntity>(
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

export async function holdDeliveryOrder(
  id: number,
  { onHold, reason }: { onHold: boolean; reason?: string },
): Promise<DeliveryOrderEntity> {
  const { data } = await api.post<DeliveryOrderEntity>(
    `/delivery-orders/${id}/hold`,
    { onHold, reason },
  );
  return data;
}

export async function cancelDeliveryOrder(
  id: number,
  { reason }: { reason?: string } = {},
): Promise<DeliveryOrderEntity> {
  const { data } = await api.post<DeliveryOrderEntity>(
    `/delivery-orders/${id}/cancel`,
    { reason },
  );
  return data;
}

export async function fetchDeliveryOrderActivity(
  id: number,
): Promise<AuditLogEntity[]> {
  const { data } = await api.get<AuditLogEntity[]>(
    `/delivery-orders/${id}/activity`,
  );
  return data;
}

export async function deleteDeliveryOrder(id: number): Promise<void> {
  await api.delete(`/delivery-orders/${id}`);
}
