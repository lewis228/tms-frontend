// /api/v1/rate-multipliers/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
//
// 다른 rate 도메인과 달리 upsert + 비페이지네이션:
//   GET ""  → RateMultiplierEntity[] (plain array)
//   PUT ""  → upsert (container_size + rate_group_id scope 단위)
//   DELETE /{id}
import api from "@/lib/axios";
import type { RateContainerSize, RateMultiplierEntity } from "@/types";

export async function fetchRateMultipliers(
  params: { rateGroupId?: number | null; includeInactive?: boolean } = {},
): Promise<RateMultiplierEntity[]> {
  const { data } = await api.get<RateMultiplierEntity[]>("/rate-multipliers", {
    params: {
      rate_group_id: params.rateGroupId ?? undefined,
      include_inactive: params.includeInactive ?? undefined,
    },
  });
  return data;
}

export async function upsertRateMultiplier(payload: {
  containerSize: RateContainerSize;
  rateGroupId?: number | null;
  factor: number;
  note?: string | null;
}): Promise<RateMultiplierEntity> {
  const { data } = await api.put<RateMultiplierEntity>(
    "/rate-multipliers",
    payload,
  );
  return data;
}

export async function deleteRateMultiplier(id: number): Promise<void> {
  await api.delete(`/rate-multipliers/${id}`);
}
