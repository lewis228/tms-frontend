// /api/v1/invoices/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
// 고객 청구(invoice) — create(prefill from D/O) / PATCH header / lines / transition.
// Decimal 필드(costTotal/chargeTotal/margin/amount/...)는 문자열로 직렬화한다.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  InvoiceDetailEntity,
  InvoiceEntity,
  InvoiceStatus,
  PagedResponse,
} from "@/types";

export type InvoiceCreatePayload = {
  customerId: number;
  deliveryOrderId?: number | null;
  invoiceNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  note?: string | null;
  prefillFromDo?: boolean;
};

export async function createInvoice(
  payload: InvoiceCreatePayload,
): Promise<InvoiceDetailEntity> {
  const { data } = await api.post<InvoiceDetailEntity>("/invoices", payload);
  return data;
}

export async function fetchInvoices(
  params: {
    page?: number;
    size?: number;
    customerId?: number;
    deliveryOrderId?: number;
    status?: InvoiceStatus;
  } = {},
): Promise<PagedResponse<InvoiceEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.customerId != null)
    queryParams["where__customer_id__equal"] = params.customerId;
  if (params.deliveryOrderId != null)
    queryParams["where__delivery_order_id__equal"] = params.deliveryOrderId;
  if (params.status) queryParams["where__status__equal"] = params.status;
  const { data } = await api.get<CursorResponse<InvoiceEntity>>("/invoices", {
    params: queryParams,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchInvoice(id: number): Promise<InvoiceDetailEntity> {
  const { data } = await api.get<InvoiceDetailEntity>(`/invoices/${id}`);
  return data;
}

export type InvoiceUpdatePayload = {
  invoiceNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  note?: string | null;
};

export async function updateInvoice(
  id: number,
  payload: InvoiceUpdatePayload,
): Promise<InvoiceDetailEntity> {
  const { data } = await api.patch<InvoiceDetailEntity>(
    `/invoices/${id}`,
    payload,
  );
  return data;
}

export async function deleteInvoice(id: number): Promise<void> {
  await api.delete(`/invoices/${id}`);
}

export async function recomputeInvoiceCost(
  id: number,
): Promise<InvoiceDetailEntity> {
  const { data } = await api.post<InvoiceDetailEntity>(
    `/invoices/${id}/recompute-cost`,
  );
  return data;
}

export type InvoiceLineCreatePayload = {
  description: string;
  quantity: string;
  unitAmount: string;
  containerId?: number | null;
  note?: string | null;
};

export async function addInvoiceLine(
  id: number,
  payload: InvoiceLineCreatePayload,
): Promise<InvoiceDetailEntity> {
  const { data } = await api.post<InvoiceDetailEntity>(
    `/invoices/${id}/lines`,
    payload,
  );
  return data;
}

export type InvoiceLineUpdatePayload = {
  description?: string;
  quantity?: string;
  unitAmount?: string;
  note?: string | null;
};

export async function updateInvoiceLine(
  id: number,
  lineId: number,
  payload: InvoiceLineUpdatePayload,
): Promise<InvoiceDetailEntity> {
  const { data } = await api.patch<InvoiceDetailEntity>(
    `/invoices/${id}/lines/${lineId}`,
    payload,
  );
  return data;
}

export async function deleteInvoiceLine(
  id: number,
  lineId: number,
): Promise<InvoiceDetailEntity> {
  const { data } = await api.delete<InvoiceDetailEntity>(
    `/invoices/${id}/lines/${lineId}`,
  );
  return data;
}

export async function transitionInvoice(
  id: number,
  target: InvoiceStatus,
): Promise<InvoiceDetailEntity> {
  const { data } = await api.post<InvoiceDetailEntity>(
    `/invoices/${id}/transition`,
    { target },
  );
  return data;
}
