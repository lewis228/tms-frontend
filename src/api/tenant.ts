// /api/v1/tenants/* 매핑.
import api from "@/lib/axios";
import type { TenantEntity } from "@/types";

export async function fetchMyTenant(): Promise<TenantEntity> {
  const { data } = await api.get<TenantEntity>("/tenants/me");
  return data;
}

export async function listTenants(): Promise<TenantEntity[]> {
  const { data } = await api.get<TenantEntity[]>("/tenants");
  return data;
}

export async function fetchTenant(id: number): Promise<TenantEntity> {
  const { data } = await api.get<TenantEntity>(`/tenants/${id}`);
  return data;
}

export async function createTenant(payload: {
  name: string;
  slug: string;
  planTier?: string;
  timezone?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}): Promise<TenantEntity> {
  const { data } = await api.post<TenantEntity>("/tenants", payload);
  return data;
}

export async function updateTenant(
  id: number,
  payload: Partial<{
    name: string;
    planTier: string;
    timezone: string;
    isActive: boolean;
    contactEmail: string | null;
    contactPhone: string | null;
  }>,
): Promise<TenantEntity> {
  const { data } = await api.patch<TenantEntity>(`/tenants/${id}`, payload);
  return data;
}

export async function deleteTenant(id: number): Promise<void> {
  await api.delete(`/tenants/${id}`);
}
