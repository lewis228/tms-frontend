// /api/v1/chassis/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  ChassisEntity,
  ChassisOwnerKind,
  ChassisSize,
  ChassisStatus,
  PagedResponse,
} from "@/types";

export type ChassisCreatePayload = {
  chassisNumber: string;
  size?: ChassisSize | null;
  ownerKind?: ChassisOwnerKind;
  ownerDriverId?: number | null;
  ownerPoolId?: number | null;
  status?: ChassisStatus;
  currentLocationId?: number | null;
  note?: string | null;
  registrationExpiresAt?: string | null;
  inspectionExpiresAt?: string | null;
};

export type ChassisUpdatePayload = Partial<ChassisCreatePayload>;

export async function fetchChassis(
  params: {
    page?: number;
    size?: number;
    chassisNumber?: string;
    ownerKind?: ChassisOwnerKind;
    ownerDriverId?: number;
    ownerPoolId?: number;
    status?: ChassisStatus;
  } = {},
): Promise<PagedResponse<ChassisEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.chassisNumber)
    queryParams["where__chassis_number__i_like"] = params.chassisNumber;
  if (params.ownerKind) queryParams["where__owner_kind__equal"] = params.ownerKind;
  if (params.ownerDriverId !== undefined)
    queryParams["where__owner_driver_id__equal"] = params.ownerDriverId;
  if (params.ownerPoolId !== undefined)
    queryParams["where__owner_pool_id__equal"] = params.ownerPoolId;
  if (params.status) queryParams["where__status__equal"] = params.status;
  const { data } = await api.get<CursorResponse<ChassisEntity>>("/chassis", {
    params: queryParams,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchChassisById(id: number): Promise<ChassisEntity> {
  const { data } = await api.get<ChassisEntity>(`/chassis/${id}`);
  return data;
}

export async function createChassis(
  payload: ChassisCreatePayload,
): Promise<ChassisEntity> {
  const { data } = await api.post<ChassisEntity>("/chassis", payload);
  return data;
}

export async function updateChassis(
  id: number,
  payload: ChassisUpdatePayload,
): Promise<ChassisEntity> {
  const { data } = await api.patch<ChassisEntity>(`/chassis/${id}`, payload);
  return data;
}

export async function deleteChassis(id: number): Promise<void> {
  await api.delete(`/chassis/${id}`);
}
