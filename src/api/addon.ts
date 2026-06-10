// /api/v1/addons/* 매핑 — 부가요금 타입 마스터(에드온 카탈로그).
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  AddonCategory,
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
  driverId?: number | null;
  note?: string | null;
};

export type AddonUpdatePayload = Partial<Omit<AddonCreatePayload, "code" | "driverId">>;

export async function fetchAddons(
  params: { page?: number; size?: number; category?: AddonCategory; code?: string } = {},
): Promise<PagedResponse<AddonEntity>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page,
    size: params.size,
    // 콤보/관리: 팀 전역 타입만(드라이버 override 행 제외)
    where__driver_id__equal: undefined,
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
