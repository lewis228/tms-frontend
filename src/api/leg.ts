// /api/v1/legs/* 매핑 (Phase 4 에서는 list-by-DO + byId 만 사용).
import api from "@/lib/axios";
import type { LegEntity, PagedResponse } from "@/types";

export async function fetchLegsByDeliveryOrder(
  deliveryOrderId: string,
): Promise<LegEntity[]> {
  // 백엔드 라우터: GET /legs?deliveryOrderId=... → PagedResponse 반환 (filter 시 server 가 list 일괄 반환).
  const { data } = await api.get<PagedResponse<LegEntity>>("/legs", {
    params: { deliveryOrderId, page: 1, size: 100 },
  });
  return data.items;
}

export async function fetchLeg(id: string): Promise<LegEntity> {
  const { data } = await api.get<LegEntity>(`/legs/${id}`);
  return data;
}
