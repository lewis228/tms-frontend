// /api/v1/containers/* 매핑.
//
// H-1: D/O 1:N container. 컨테이너별 destination/seal/weight/LFD/service_type/status.
// 백엔드 응답 키는 camelCase.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  ContainerEntity,
  ContainerEventEntity,
  ContainerEventKind,
  ContainerSize,
  DeliveryStatus,
  PagedResponse,
  ServiceType,
} from "@/types";

// D/O Create 시 nested 로 함께 보내는 컨테이너 1건.
export type ContainerCreateInnerPayload = {
  sequenceNo?: number | null;
  containerNumber?: string | null;
  sealNo?: string | null;
  size?: ContainerSize | null;
  type?: string | null;
  weightKg?: number | string | null;
  chassisId?: number | null;
  pickupAppointment?: string | null;
  deliveryAppointment?: string | null;
  returnAppointment?: string | null;
  demurrageLfd?: string | null;
  detentionLfd?: string | null;
  emptyDate?: string | null;
  loadedDate?: string | null;
  deliveryLocationId?: number | null;
  returnLocationId?: number | null;
  serviceType?: ServiceType | null;
  pierPassPaid?: boolean;
  customsCleared?: boolean;
  status?: DeliveryStatus;
  note?: string | null;
};

export type ContainerCreatePayload = ContainerCreateInnerPayload & {
  deliveryOrderId: number;
};

export type ContainerUpdatePayload = Partial<ContainerCreateInnerPayload>;

export async function fetchContainers(
  params: {
    page?: number;
    size?: number;
    deliveryOrderId?: number;
    containerNumber?: string;
    status?: DeliveryStatus;
  } = {},
): Promise<PagedResponse<ContainerEntity>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.deliveryOrderId !== undefined) {
    queryParams["where__delivery_order_id__equal"] = params.deliveryOrderId;
  }
  if (params.containerNumber) {
    queryParams["where__container_number__i_like"] = params.containerNumber;
  }
  if (params.status) {
    queryParams["where__status__equal"] = params.status;
  }
  const { data } = await api.get<CursorResponse<ContainerEntity>>(
    "/containers",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchContainer(id: number): Promise<ContainerEntity> {
  const { data } = await api.get<ContainerEntity>(`/containers/${id}`);
  return data;
}

export async function createContainer(
  payload: ContainerCreatePayload,
): Promise<ContainerEntity> {
  const { data } = await api.post<ContainerEntity>("/containers", payload);
  return data;
}

export async function updateContainer(
  id: number,
  payload: ContainerUpdatePayload,
): Promise<ContainerEntity> {
  const { data } = await api.patch<ContainerEntity>(
    `/containers/${id}`,
    payload,
  );
  return data;
}

export async function deleteContainer(id: number): Promise<void> {
  await api.delete(`/containers/${id}`);
}

// ── 이벤트 ────────────────────────────────────────────────────

export type ContainerEventCreatePayload = {
  eventKind: ContainerEventKind;
  locationId?: number | null;
  legId?: number | null;
  occurredAt: string;
  note?: string | null;
};

export async function addContainerEvent(
  containerId: number,
  payload: ContainerEventCreatePayload,
): Promise<ContainerEventEntity> {
  const { data } = await api.post<ContainerEventEntity>(
    `/containers/${containerId}/events`,
    payload,
  );
  return data;
}

export async function fetchContainerEvents(
  containerId: number,
): Promise<ContainerEventEntity[]> {
  const { data } = await api.get<ContainerEventEntity[]>(
    `/containers/${containerId}/events`,
  );
  return data;
}
