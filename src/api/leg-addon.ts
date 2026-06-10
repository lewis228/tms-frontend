// /api/v1/leg-addons/* 매핑 — leg 단위 Add-on(추가요금 한 줄, 중복 가능).
import api from "@/lib/axios";
import type { LegAddonEntity, PointType } from "@/types";

export type LegAddonCreatePayload = {
  legId: number;
  addonId: number;  // addon 마스터 타입
  quantity?: string;
  unitAmount?: string | null;
  // amount 미지정(null)이면 백엔드가 addon 마스터 단가로 자동 채움.
  amount?: string | null;
  amountOverride?: string | null;
  // STP 등 위치형 add-on
  pointType?: PointType | null;
  terminalId?: number | null;
  locationId?: number | null;
  customerId?: number | null;
  note?: string | null;
};

export type LegAddonUpdatePayload = {
  quantity?: string | null;
  unitAmount?: string | null;
  amount?: string | null;
  amountOverride?: string | null;
  note?: string | null;
};

// GET /leg-addons 는 배열 직접 반환(페이지네이션 아님). leg_id 는 raw Query 파라미터라 snake.
export async function fetchLegAddons(legId: number): Promise<LegAddonEntity[]> {
  const { data } = await api.get<LegAddonEntity[]>("/leg-addons", {
    params: { leg_id: legId },
  });
  return data;
}

export async function createLegAddon(
  payload: LegAddonCreatePayload,
): Promise<LegAddonEntity> {
  const { data } = await api.post<LegAddonEntity>("/leg-addons", payload);
  return data;
}

export async function updateLegAddon(
  addonId: number,
  payload: LegAddonUpdatePayload,
): Promise<LegAddonEntity> {
  const { data } = await api.patch<LegAddonEntity>(
    `/leg-addons/${addonId}`,
    payload,
  );
  return data;
}

export async function deleteLegAddon(addonId: number): Promise<void> {
  await api.delete(`/leg-addons/${addonId}`);
}
