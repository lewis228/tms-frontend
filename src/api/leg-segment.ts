// /api/v1/legs/{leg_id}/segments + /api/v1/leg-segments/{id}
import api from "@/lib/axios";
import type { LegDriverSegmentEntity, HandoverReason } from "@/types";

export async function fetchLegSegments(
  legId: number,
): Promise<LegDriverSegmentEntity[]> {
  const { data } = await api.get<LegDriverSegmentEntity[]>(
    `/legs/${legId}/segments`,
  );
  return data;
}

export type LegSegmentCreatePayload = {
  legId: number;
  driverId: number;
  truckId?: number | null;
  sequenceNo?: number | null;
  startedAt?: string | null;
  endedAt?: string | null;
  handoverReason?: HandoverReason | null;
  note?: string | null;
};

export async function createLegSegment(
  legId: number,
  payload: Omit<LegSegmentCreatePayload, "legId">,
): Promise<LegDriverSegmentEntity> {
  const { data } = await api.post<LegDriverSegmentEntity>(
    `/legs/${legId}/segments`,
    { ...payload, legId },
  );
  return data;
}

export type LegSegmentUpdatePayload = Partial<
  Omit<LegSegmentCreatePayload, "legId">
>;

export async function updateLegSegment(
  segmentId: number,
  payload: LegSegmentUpdatePayload,
): Promise<LegDriverSegmentEntity> {
  const { data } = await api.patch<LegDriverSegmentEntity>(
    `/leg-segments/${segmentId}`,
    payload,
  );
  return data;
}

export async function deleteLegSegment(segmentId: number): Promise<void> {
  await api.delete(`/leg-segments/${segmentId}`);
}
