// /api/v1/customers/* 매핑.
import api from "@/lib/axios";
import type { CustomerEntity, PagedResponse } from "@/types";

export async function fetchCustomers(
  params: { page?: number; size?: number } = {},
): Promise<PagedResponse<CustomerEntity>> {
  const { data } = await api.get<PagedResponse<CustomerEntity>>("/customers", {
    params,
  });
  return data;
}

export async function fetchCustomer(id: string): Promise<CustomerEntity> {
  const { data } = await api.get<CustomerEntity>(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: {
  name: string;
  code?: string | null;
  billingAddress?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  note?: string | null;
}): Promise<CustomerEntity> {
  const { data } = await api.post<CustomerEntity>("/customers", payload);
  return data;
}

export async function updateCustomer(
  id: string,
  payload: Partial<{
    name: string;
    code: string | null;
    billingAddress: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    isActive: boolean;
    note: string | null;
  }>,
): Promise<CustomerEntity> {
  const { data } = await api.patch<CustomerEntity>(`/customers/${id}`, payload);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
