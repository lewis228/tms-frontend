// /api/v1/customers/* 매핑.
import api from "@/lib/axios";
import type { CustomerEntity, PagedResponse } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchCustomers(
  params: { page?: number; size?: number; q?: string } = {},
): Promise<PagedResponse<CustomerEntity>> {
  const { data } = await api.get<CursorResponse<CustomerEntity>>("/customers", {
    params,
  });
  return adaptCursorToPaged(data, params?.page, params?.size);
}

export async function fetchCustomer(id: number): Promise<CustomerEntity> {
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
  id: number,
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

export async function deleteCustomer(id: number): Promise<void> {
  await api.delete(`/customers/${id}`);
}
