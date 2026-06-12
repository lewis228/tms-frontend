// /api/v1/driver-rate-assignments/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
import api from "@/lib/axios";
import type { DriverRateAssignmentEntity, PagedResponse } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchDriverRateAssignments(
  params: {
    page?: number;
    size?: number;
    driverId?: number;
    rateGroupId?: number;
  } = {}
): Promise<PagedResponse<DriverRateAssignmentEntity>> {
  // 백엔드 cursor pagination 은 take 만 인식 (page/size 는 무시됨).
  // include_total=true 로 meta.total 을 받아야 총건수/페이지 계산이 올바르다.
  const queryParams: Record<string, string | number | boolean | undefined> = {
    take: params.size ?? 20,
    include_total: true,
  };
  if (params.driverId != null)
    queryParams["where__driver_id__equal"] = params.driverId;
  if (params.rateGroupId != null)
    queryParams["where__rate_group_id__equal"] = params.rateGroupId;
  const { data } = await api.get<CursorResponse<DriverRateAssignmentEntity>>(
    "/driver-rate-assignments",
    { params: queryParams }
  );
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchDriverRateAssignment(
  id: number
): Promise<DriverRateAssignmentEntity> {
  const { data } = await api.get<DriverRateAssignmentEntity>(
    `/driver-rate-assignments/${id}`
  );
  return data;
}

export async function createDriverRateAssignment(payload: {
  driverId: number;
  rateGroupId: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  note?: string | null;
}): Promise<DriverRateAssignmentEntity> {
  const { data } = await api.post<DriverRateAssignmentEntity>(
    "/driver-rate-assignments",
    payload
  );
  return data;
}

export async function updateDriverRateAssignment(
  id: number,
  payload: Partial<{
    rateGroupId: number;
    effectiveFrom: string;
    effectiveTo: string | null;
    note: string | null;
  }>
): Promise<DriverRateAssignmentEntity> {
  const { data } = await api.put<DriverRateAssignmentEntity>(
    `/driver-rate-assignments/${id}`,
    payload
  );
  return data;
}

export async function deleteDriverRateAssignment(id: number): Promise<void> {
  await api.delete(`/driver-rate-assignments/${id}`);
}
