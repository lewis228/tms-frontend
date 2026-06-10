// /api/v1/payroll/* 매핑. (axios baseURL 이 이미 /api/v1 포함)
// 드라이버 정산(payroll) — preview / build / lifecycle(confirm/paid/void) / charges.
// Decimal 필드(baseTotal/grandTotal/baseAmount/amount/...)는 문자열로 직렬화한다.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  PagedResponse,
  PayrollBuildPeriodResult,
  PayrollDetailEntity,
  PayrollEntity,
  PayrollPeriodSummary,
  PayrollPreview,
  PayrollStatus,
} from "@/types";

export type PayrollBuildPayload = {
  driverId: number;
  periodStart: string;
  periodEnd: string;
};

export async function previewPayroll(
  payload: PayrollBuildPayload,
): Promise<PayrollPreview> {
  const { data } = await api.post<PayrollPreview>("/payroll/preview", payload);
  return data;
}

export async function buildPayroll(
  payload: PayrollBuildPayload,
): Promise<PayrollDetailEntity> {
  const { data } = await api.post<PayrollDetailEntity>("/payroll", payload);
  return data;
}

export async function buildPeriodPayroll(payload: {
  periodStart: string;
  periodEnd: string;
  driverIds?: number[] | null;
}): Promise<PayrollBuildPeriodResult> {
  const { data } = await api.post<PayrollBuildPeriodResult>(
    "/payroll/build-period",
    payload,
  );
  return data;
}

export async function fetchPayrolls(
  params: {
    page?: number;
    size?: number;
    driverId?: number;
    status?: PayrollStatus;
  } = {},
): Promise<PagedResponse<PayrollEntity>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    size: params.size,
  };
  if (params.driverId != null)
    queryParams["where__driver_id__equal"] = params.driverId;
  if (params.status) queryParams["where__status__equal"] = params.status;
  const { data } = await api.get<CursorResponse<PayrollEntity>>("/payroll", {
    params: queryParams,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchPayroll(id: number): Promise<PayrollDetailEntity> {
  const { data } = await api.get<PayrollDetailEntity>(`/payroll/${id}`);
  return data;
}

export async function fetchPayrollPeriodSummary(params: {
  periodStart: string;
  periodEnd: string;
}): Promise<PayrollPeriodSummary> {
  const { data } = await api.get<PayrollPeriodSummary>(
    "/payroll/period-summary",
    {
      params: {
        period_start: params.periodStart,
        period_end: params.periodEnd,
      },
    },
  );
  return data;
}

export async function fetchPayrollBiweeklyPeriod(
  ref: string,
): Promise<PayrollPeriodSummary> {
  const { data } = await api.get<PayrollPeriodSummary>(
    "/payroll/biweekly-period",
    { params: { ref } },
  );
  return data;
}

export async function confirmPayroll(
  id: number,
): Promise<PayrollDetailEntity> {
  const { data } = await api.post<PayrollDetailEntity>(`/payroll/${id}/confirm`);
  return data;
}

export async function markPayrollPaid(
  id: number,
): Promise<PayrollDetailEntity> {
  const { data } = await api.post<PayrollDetailEntity>(`/payroll/${id}/paid`);
  return data;
}

export async function voidPayroll(id: number): Promise<PayrollDetailEntity> {
  const { data } = await api.post<PayrollDetailEntity>(`/payroll/${id}/void`);
  return data;
}

export type PayrollChargeAddPayload = {
  code: string;
  addonId?: number | null;
  snapshotUnitAmount?: string | null;
  quantity: string;
  amount: string;
  note?: string | null;
};

export async function addPayrollCharge(
  id: number,
  payload: PayrollChargeAddPayload,
): Promise<PayrollDetailEntity> {
  const { data } = await api.post<PayrollDetailEntity>(
    `/payroll/${id}/charges`,
    payload,
  );
  return data;
}

export async function deletePayroll(id: number): Promise<void> {
  await api.delete(`/payroll/${id}`);
}
