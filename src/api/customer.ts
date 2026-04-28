// /api/v1/customers/* 매핑. H-5: kind 필터 + carrier 컴플라이언스.
import api from "@/lib/axios";
import type { CustomerEntity, PagedResponse, PartnerKind } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export type CustomerCreatePayload = {
  name: string;
  code?: string | null;
  kind?: PartnerKind;
  billingAddress?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  mcNumber?: string | null;
  dotNumber?: string | null;
  insuranceExpiresAt?: string | null;
  insuranceDocUrl?: string | null;
  w9DocUrl?: string | null;
  paymentTermsDays?: number | null;
  note?: string | null;
};

export type CustomerUpdatePayload = Partial<CustomerCreatePayload> & {
  isActive?: boolean;
};

export async function fetchCustomers(
  params: { page?: number; size?: number; q?: string; kind?: PartnerKind } = {},
): Promise<PagedResponse<CustomerEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
    q: params.q,
  };
  if (params.kind) queryParams["where__kind__equal"] = params.kind;
  const { data } = await api.get<CursorResponse<CustomerEntity>>("/customers", {
    params: queryParams,
  });
  return adaptCursorToPaged(data, params?.page, params?.size);
}

export async function fetchCustomer(id: number): Promise<CustomerEntity> {
  const { data } = await api.get<CustomerEntity>(`/customers/${id}`);
  return data;
}

export async function createCustomer(
  payload: CustomerCreatePayload,
): Promise<CustomerEntity> {
  const { data } = await api.post<CustomerEntity>("/customers", payload);
  return data;
}

export async function updateCustomer(
  id: number,
  payload: CustomerUpdatePayload,
): Promise<CustomerEntity> {
  const { data } = await api.patch<CustomerEntity>(`/customers/${id}`, payload);
  return data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await api.delete(`/customers/${id}`);
}
