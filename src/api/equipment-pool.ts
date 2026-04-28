// /api/v1/equipment-pools/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  EquipmentPoolEntity,
  EquipmentPoolKind,
  PagedResponse,
} from "@/types";

export type EquipmentPoolCreatePayload = {
  name: string;
  kind: EquipmentPoolKind;
  operator?: string | null;
  locationId?: number | null;
  contact?: string | null;
  note?: string | null;
};

export type EquipmentPoolUpdatePayload = Partial<EquipmentPoolCreatePayload>;

export async function fetchEquipmentPools(
  params: { page?: number; size?: number; kind?: EquipmentPoolKind } = {},
): Promise<PagedResponse<EquipmentPoolEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.kind) queryParams["where__kind__equal"] = params.kind;
  const { data } = await api.get<CursorResponse<EquipmentPoolEntity>>(
    "/equipment-pools",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchEquipmentPool(
  id: number,
): Promise<EquipmentPoolEntity> {
  const { data } = await api.get<EquipmentPoolEntity>(
    `/equipment-pools/${id}`,
  );
  return data;
}

export async function createEquipmentPool(
  payload: EquipmentPoolCreatePayload,
): Promise<EquipmentPoolEntity> {
  const { data } = await api.post<EquipmentPoolEntity>(
    "/equipment-pools",
    payload,
  );
  return data;
}

export async function updateEquipmentPool(
  id: number,
  payload: EquipmentPoolUpdatePayload,
): Promise<EquipmentPoolEntity> {
  const { data } = await api.patch<EquipmentPoolEntity>(
    `/equipment-pools/${id}`,
    payload,
  );
  return data;
}

export async function deleteEquipmentPool(id: number): Promise<void> {
  await api.delete(`/equipment-pools/${id}`);
}
