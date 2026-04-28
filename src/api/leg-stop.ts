// /api/v1/leg-stops/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type { LegStopEntity, PagedResponse, StopKind } from "@/types";

export type LegStopCreatePayload = {
  legId: number;
  sequenceNo?: number;
  stopKind: StopKind;
  locationId?: number | null;
  containerId?: number | null;
  chassisId?: number | null;
  arrivedAt?: string | null;
  departedAt?: string | null;
  note?: string | null;
};

export type LegStopUpdatePayload = Partial<Omit<LegStopCreatePayload, "legId">>;

export async function fetchLegStops(
  params: { page?: number; size?: number; legId?: number } = {},
): Promise<PagedResponse<LegStopEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.legId !== undefined)
    queryParams["where__leg_id__equal"] = params.legId;
  const { data } = await api.get<CursorResponse<LegStopEntity>>("/leg-stops", {
    params: queryParams,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchLegStopsByLeg(
  legId: number,
): Promise<LegStopEntity[]> {
  const { data } = await api.get<LegStopEntity[]>(
    `/leg-stops/by-leg/${legId}`,
  );
  return data;
}

export async function createLegStop(
  payload: LegStopCreatePayload,
): Promise<LegStopEntity> {
  const { data } = await api.post<LegStopEntity>("/leg-stops", payload);
  return data;
}

export async function updateLegStop(
  id: number,
  payload: LegStopUpdatePayload,
): Promise<LegStopEntity> {
  const { data } = await api.patch<LegStopEntity>(`/leg-stops/${id}`, payload);
  return data;
}

export async function deleteLegStop(id: number): Promise<void> {
  await api.delete(`/leg-stops/${id}`);
}
