import api from "@/lib/axios";
import type { TenantEntity } from "@/types";

export async function createTenant({ name }: { name: string }) {
  const { data } = await api.post<TenantEntity>("/tenant", { name });
  return data;
}

export async function fetchTenantById(tenantId: number) {
  const { data } = await api.get<TenantEntity>(`/tenant/${tenantId}`);
  return data;
}

// Partial update. All fields optional — omitted keys are left untouched on
// the server thanks to Pydantic's `exclude_unset` in the router.
export type UpdateTenantPayload = {
  name?: string;
  email?: string | null;
  memo?: string | null;
  timezone?: string | null;
};

export async function updateTenant({
  tenantId,
  payload,
}: {
  tenantId: number;
  payload: UpdateTenantPayload;
}) {
  const { data } = await api.patch<TenantEntity>(`/tenant/${tenantId}`, payload);
  return data;
}

// Permanently deletes the tenant. Server cascades to shipments, events, API
// keys, and memberships. Returns the id so the caller can invalidate the
// right cache entries.
export async function deleteTenant(tenantId: number) {
  await api.delete(`/tenant/${tenantId}`);
  return { tenant_id: tenantId };
}

