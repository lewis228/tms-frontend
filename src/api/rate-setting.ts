// /api/v1/rate-settings/* 매핑 (ADMIN+).
import api from "@/lib/axios";
import type { PagedResponse, RateSettingEntity, RateType } from "@/types";

export type RateSettingCreatePayload = {
  name: string;
  rateType: RateType;
  flatAmount?: string | null;
  ratePercent?: string | null;
  ratePerMile?: string | null;
  effectiveDate: string;
  description?: string | null;
};

export type RateSettingUpdatePayload = Partial<{
  name: string;
  flatAmount: string | null;
  ratePercent: string | null;
  ratePerMile: string | null;
  effectiveDate: string;
  isActive: boolean;
  description: string | null;
}>;

export async function fetchRateSettings(
  params: { page?: number; size?: number } = {},
): Promise<PagedResponse<RateSettingEntity>> {
  const { data } = await api.get<PagedResponse<RateSettingEntity>>(
    "/rate-settings",
    { params },
  );
  return data;
}

export async function fetchRateSetting(id: string): Promise<RateSettingEntity> {
  const { data } = await api.get<RateSettingEntity>(`/rate-settings/${id}`);
  return data;
}

export async function createRateSetting(
  payload: RateSettingCreatePayload,
): Promise<RateSettingEntity> {
  const { data } = await api.post<RateSettingEntity>(
    "/rate-settings",
    payload,
  );
  return data;
}

export async function updateRateSetting(
  id: string,
  payload: RateSettingUpdatePayload,
): Promise<RateSettingEntity> {
  const { data } = await api.patch<RateSettingEntity>(
    `/rate-settings/${id}`,
    payload,
  );
  return data;
}

export async function deleteRateSetting(id: string): Promise<void> {
  await api.delete(`/rate-settings/${id}`);
}
