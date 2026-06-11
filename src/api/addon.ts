// /api/v1/addons/* 매핑 — 부가요금 타입 마스터(에드온 카탈로그).
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  AddonCategory,
  AddonDriverRate,
  AddonEntity,
  AddonUnit,
  PagedResponse,
} from "@/types";

export type AddonCreatePayload = {
  code: string;
  name: string;
  category: AddonCategory;
  unit: AddonUnit;
  amount?: string | null;
  percent?: string | null;
  freeMinutes?: number | null;
  freeDays?: number | null;
  autoApply?: boolean;
  isBillableToCustomer?: boolean;
  isPayableToDriver?: boolean;
  note?: string | null;
};

export type AddonUpdatePayload = Partial<Omit<AddonCreatePayload, "code">>;

export async function fetchAddons(
  params: { page?: number; size?: number; category?: AddonCategory; code?: string } = {},
): Promise<PagedResponse<AddonEntity>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.code) queryParams["where__code__i_like"] = params.code;
  if (params.category) queryParams["where__category__equal"] = params.category;
  const { data } = await api.get<CursorResponse<AddonEntity>>("/addons", {
    params: queryParams,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function createAddon(payload: AddonCreatePayload): Promise<AddonEntity> {
  const { data } = await api.post<AddonEntity>("/addons", payload);
  return data;
}

export async function updateAddon(
  id: number,
  payload: AddonUpdatePayload,
): Promise<AddonEntity> {
  // 백엔드 addon 라우터는 PUT /{id}
  const { data } = await api.put<AddonEntity>(`/addons/${id}`, payload);
  return data;
}

export async function deleteAddon(id: number): Promise<void> {
  await api.delete(`/addons/${id}`);
}

export async function seedDefaultAddons(): Promise<{ created: number; skipped: number }> {
  const { data } = await api.post<{ created: number; skipped: number }>(
    "/addons/seed-defaults",
    {},
  );
  return data;
}

// ── 기사별 금액 override (addon_driver_rate) ─────────────────────
export async function fetchAddonDriverRates(
  addonId: number,
): Promise<AddonDriverRate[]> {
  const { data } = await api.get<AddonDriverRate[]>(
    `/addons/${addonId}/driver-rates`,
  );
  return data;
}

export async function upsertAddonDriverRate(
  addonId: number,
  driverId: number,
  payload: { amount?: string | null; percent?: string | null; note?: string | null },
): Promise<AddonDriverRate> {
  const { data } = await api.put<AddonDriverRate>(
    `/addons/${addonId}/driver-rates/${driverId}`,
    payload,
  );
  return data;
}

export async function deleteAddonDriverRate(
  addonId: number,
  driverId: number,
): Promise<void> {
  await api.delete(`/addons/${addonId}/driver-rates/${driverId}`);
}
