// /api/v1/distance-matrix/* — 거리/시간 캐시
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  DistanceMatrixEntity,
  PagedResponse,
  DistanceProvider,
} from "@/types";

export async function fetchDistanceMatrix(
  params: {
    page?: number;
    size?: number;
    originLocationId?: number;
    destinationLocationId?: number;
  } = {},
): Promise<PagedResponse<DistanceMatrixEntity>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.originLocationId !== undefined) {
    queryParams["where__origin_location_id__equal"] = params.originLocationId;
  }
  if (params.destinationLocationId !== undefined) {
    queryParams["where__destination_location_id__equal"] =
      params.destinationLocationId;
  }
  const { data } = await api.get<CursorResponse<DistanceMatrixEntity>>(
    "/distance-matrix",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export type DistanceMatrixCreatePayload = {
  originLocationId: number;
  destinationLocationId: number;
  distanceValue: string | number;
  durationMin?: string | number;
  source?: DistanceProvider;
  measuredAt?: string | null;
  note?: string | null;
};

export async function createDistanceMatrix(
  payload: DistanceMatrixCreatePayload,
): Promise<DistanceMatrixEntity> {
  const { data } = await api.post<DistanceMatrixEntity>(
    "/distance-matrix",
    payload,
  );
  return data;
}

export async function updateDistanceMatrix(
  id: number,
  payload: Partial<DistanceMatrixCreatePayload>,
): Promise<DistanceMatrixEntity> {
  const { data } = await api.patch<DistanceMatrixEntity>(
    `/distance-matrix/${id}`,
    payload,
  );
  return data;
}

export async function deleteDistanceMatrix(id: number): Promise<void> {
  await api.delete(`/distance-matrix/${id}`);
}

// provider 어댑터로 거리 측정 + 캐시
export type DistanceMeasurePayload = {
  originLocationId: number;
  destinationLocationId: number;
  provider?: DistanceProvider;
};

export async function measureDistance(
  payload: DistanceMeasurePayload,
): Promise<DistanceMatrixEntity> {
  const { data } = await api.post<DistanceMatrixEntity>(
    "/distance-matrix/measure",
    payload,
  );
  return data;
}
