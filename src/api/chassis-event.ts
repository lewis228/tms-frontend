// /api/v1/chassis-events/* 매핑.
import api from "@/lib/axios";
import type { ChassisEventEntity, ChassisEventKind } from "@/types";

export type ChassisEventCreatePayload = {
  chassisId: number;
  legId?: number | null;
  eventKind: ChassisEventKind;
  locationId?: number | null;
  occurredAt: string;
  note?: string | null;
};

export async function createChassisEvent(
  payload: ChassisEventCreatePayload,
): Promise<ChassisEventEntity> {
  const { data } = await api.post<ChassisEventEntity>(
    "/chassis-events",
    payload,
  );
  return data;
}

export async function fetchChassisEventsByChassis(
  chassisId: number,
): Promise<ChassisEventEntity[]> {
  const { data } = await api.get<ChassisEventEntity[]>(
    `/chassis-events/by-chassis/${chassisId}`,
  );
  return data;
}
