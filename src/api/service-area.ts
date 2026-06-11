// /api/v1/service-areas/* 매핑 — 팀 영업권역 선언 CRUD.
// 선언이 있으면 zip/도시 검색의 scope=true 가 이 범위로 제한된다.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  PagedResponse,
  ServiceAreaEntity,
  ServiceAreaKind,
} from "@/types";

// 백엔드 cursor pagination 은 take 만 인식 (page/size 는 무시됨).
// 선언 수가 적어 take 100 한 번이면 충분.
export async function fetchServiceAreas(): Promise<
  PagedResponse<ServiceAreaEntity>
> {
  const { data } = await api.get<CursorResponse<ServiceAreaEntity>>(
    "/service-areas",
    { params: { take: 100 } }
  );
  return adaptCursorToPaged(data, 1, 100);
}

export async function createServiceArea(payload: {
  kind: ServiceAreaKind;
  state: string;
  value?: string | null;
}): Promise<ServiceAreaEntity> {
  const { data } = await api.post<ServiceAreaEntity>("/service-areas", payload);
  return data;
}

export async function deleteServiceArea(id: number): Promise<void> {
  await api.delete(`/service-areas/${id}`);
}
