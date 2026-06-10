// /api/v1/delivery-orders/{do_id}/addons/* 매핑 — D/O 단위 Add-on(고객 청구용).
import api from "@/lib/axios";
import type { DeliveryOrderAddonEntity } from "@/types";

export type DoAddonCreatePayload = {
  code: string;
  quantity?: string;
  unitAmount?: string | null;
  // amount 미지정(null)이면 백엔드가 accessorial 마스터 단가로 자동 채움.
  amount?: string | null;
  note?: string | null;
};

export type DoAddonUpdatePayload = {
  quantity?: string | null;
  unitAmount?: string | null;
  amount?: string | null;
  note?: string | null;
};

// GET 은 배열 직접 반환(페이지네이션 아님).
export async function fetchDeliveryOrderAddons(
  doId: number,
): Promise<DeliveryOrderAddonEntity[]> {
  const { data } = await api.get<DeliveryOrderAddonEntity[]>(
    `/delivery-orders/${doId}/addons`,
  );
  return data;
}

export async function createDeliveryOrderAddon(
  doId: number,
  payload: DoAddonCreatePayload,
): Promise<DeliveryOrderAddonEntity> {
  const { data } = await api.post<DeliveryOrderAddonEntity>(
    `/delivery-orders/${doId}/addons`,
    payload,
  );
  return data;
}

// update/delete 는 addon_id 단독 경로(do_id 불필요).
export async function updateDeliveryOrderAddon(
  addonId: number,
  payload: DoAddonUpdatePayload,
): Promise<DeliveryOrderAddonEntity> {
  const { data } = await api.patch<DeliveryOrderAddonEntity>(
    `/delivery-orders/addons/${addonId}`,
    payload,
  );
  return data;
}

export async function deleteDeliveryOrderAddon(addonId: number): Promise<void> {
  await api.delete(`/delivery-orders/addons/${addonId}`);
}
