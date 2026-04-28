// /api/v1/trucks/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  PagedResponse,
  TruckEntity,
  TruckOwnerKind,
  TruckStatus,
} from "@/types";

export type TruckCreatePayload = {
  plateNo: string;
  vin?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  ownerKind?: TruckOwnerKind;
  ownerDriverId?: number | null;
  status?: TruckStatus;
  note?: string | null;
};

export type TruckUpdatePayload = Partial<TruckCreatePayload>;

export async function fetchTrucks(
  params: {
    page?: number;
    size?: number;
    plateNo?: string;
    ownerKind?: TruckOwnerKind;
    ownerDriverId?: number;
    status?: TruckStatus;
  } = {},
): Promise<PagedResponse<TruckEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.plateNo) queryParams["where__plate_no__i_like"] = params.plateNo;
  if (params.ownerKind) queryParams["where__owner_kind__equal"] = params.ownerKind;
  if (params.ownerDriverId !== undefined)
    queryParams["where__owner_driver_id__equal"] = params.ownerDriverId;
  if (params.status) queryParams["where__status__equal"] = params.status;
  const { data } = await api.get<CursorResponse<TruckEntity>>("/trucks", {
    params: queryParams,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchTruck(id: number): Promise<TruckEntity> {
  const { data } = await api.get<TruckEntity>(`/trucks/${id}`);
  return data;
}

export async function createTruck(
  payload: TruckCreatePayload,
): Promise<TruckEntity> {
  const { data } = await api.post<TruckEntity>("/trucks", payload);
  return data;
}

export async function updateTruck(
  id: number,
  payload: TruckUpdatePayload,
): Promise<TruckEntity> {
  const { data } = await api.patch<TruckEntity>(`/trucks/${id}`, payload);
  return data;
}

export async function deleteTruck(id: number): Promise<void> {
  await api.delete(`/trucks/${id}`);
}
