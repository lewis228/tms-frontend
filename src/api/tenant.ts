// /tenants/* 매핑.
//
// "현재 사용자의 tenant" 조회는 /users/me 응답의 user.tenants 배열 사용.
// 특정 tenant 디테일이 필요하면 fetchTenant(id).
import api from "@/lib/axios";
import type { TenantEntity } from "@/types";

export async function listTenants(): Promise<TenantEntity[]> {
  const { data } = await api.get<TenantEntity[]>("/tenants");
  return data;
}

export async function fetchTenant(id: number): Promise<TenantEntity> {
  const { data } = await api.get<TenantEntity>(`/tenants/${id}`);
  return data;
}

// 백엔드 TenantCreateRequest / TenantUpdateRequest 와 1:1 매핑.
export type TenantWritePayload = {
  name: string;
  companyName?: string | null;
  registrationNumber?: string | null;
  representativeName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  memo?: string | null;
  timezone?: string | null;
  currency?: string | null;
};

export async function createTenant(payload: TenantWritePayload): Promise<TenantEntity> {
  const { data } = await api.post<TenantEntity>("/tenants", payload);
  return data;
}

export async function updateTenant(
  id: number,
  payload: Partial<TenantWritePayload & { isActive: boolean }>,
): Promise<TenantEntity> {
  const { data } = await api.patch<TenantEntity>(`/tenants/${id}`, payload);
  return data;
}

export async function deleteTenant(id: number): Promise<void> {
  await api.delete(`/tenants/${id}`);
}

// ── 온보딩 ─────────────────────────────────────────────────
// PATCH /tenants/{id}/onboarding — 단계별 플래그 토글 / 완료 처리.
export type OnboardingPatch = {
  step1Done?: boolean;
  step2Done?: boolean;
  step3Done?: boolean;
  completed?: boolean;
};

export async function updateOnboarding(
  tenantId: number,
  payload: OnboardingPatch,
): Promise<{ ok: boolean }> {
  const { data } = await api.patch<{ ok: boolean }>(
    `/tenants/${tenantId}/onboarding`,
    payload,
  );
  return data;
}
