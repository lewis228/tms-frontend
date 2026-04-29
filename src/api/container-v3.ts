// /api/v1/containers/* v3 layer (full + list enrich) + container-stops CRUD.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  ContainerListEntity,
  ContainerFullEntity,
  ContainerStopEntity,
  StopRole,
  PagedResponse,
  ContainerWorkState,
} from "@/types";

// ── Container list (v3 enrich) ────────────────────────────────
export async function fetchContainersV3(
  params: {
    page?: number;
    size?: number;
    deliveryOrderId?: number;
    workState?: ContainerWorkState;
    containerNumber?: string;
  } = {},
): Promise<PagedResponse<ContainerListEntity>> {
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
  const { data } = await api.get<CursorResponse<ContainerListEntity>>(
    "/containers",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

// ── Container full (D/O 메타 + stops + legs + events) ─────────
export async function fetchContainerFull(
  id: number,
): Promise<ContainerFullEntity> {
  const { data } = await api.get<ContainerFullEntity>(`/containers/${id}/full`);
  return data;
}

// ── Container Stops CRUD ──────────────────────────────────────
export async function fetchContainerStops(
  containerId: number,
): Promise<ContainerStopEntity[]> {
  const { data } = await api.get<ContainerStopEntity[]>(
    `/containers/${containerId}/stops`,
  );
  return data;
}

export type ContainerStopCreatePayload = {
  containerId: number;
  role: StopRole;
  locationId?: number | null;
  sequenceNo?: number | null;
  plannedArrival?: string | null;
  plannedDeparture?: string | null;
  actualArrival?: string | null;
  actualDeparture?: string | null;
  note?: string | null;
};

export async function createContainerStop(
  containerId: number,
  payload: Omit<ContainerStopCreatePayload, "containerId">,
): Promise<ContainerStopEntity> {
  const { data } = await api.post<ContainerStopEntity>(
    `/containers/${containerId}/stops`,
    { ...payload, containerId },
  );
  return data;
}

export type ContainerStopUpdatePayload = Partial<
  Omit<ContainerStopCreatePayload, "containerId">
>;

export async function updateContainerStop(
  stopId: number,
  payload: ContainerStopUpdatePayload,
): Promise<ContainerStopEntity> {
  const { data } = await api.patch<ContainerStopEntity>(
    `/container-stops/${stopId}`,
    payload,
  );
  return data;
}

export async function deleteContainerStop(stopId: number): Promise<void> {
  await api.delete(`/container-stops/${stopId}`);
}

export type ContainerStopReorderItem = {
  stopId: number;
  sequenceNo: number;
};

export async function reorderContainerStops(
  containerId: number,
  items: ContainerStopReorderItem[],
): Promise<ContainerStopEntity[]> {
  const { data } = await api.post<ContainerStopEntity[]>(
    `/containers/${containerId}/stops/reorder`,
    { items },
  );
  return data;
}
