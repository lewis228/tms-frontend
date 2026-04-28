// /api/v1/drivers/* 매핑.
//
// 백엔드 DriverResponse 가 driver + user 합친 형태 (email/name/phone 포함). 그대로 사용.
// POST 응답은 DriverCreatedResponse — `tempPassword` 1회 노출.
import api from "@/lib/axios";
import type {
  DriverCreatedResponse,
  DriverEntity,
  PagedResponse,
} from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

export async function fetchDrivers(
  params: {
    page?: number;
    size?: number;
    activeOnly?: boolean;
    q?: string;
  } = {},
): Promise<PagedResponse<DriverEntity>> {
  const { data } = await api.get<CursorResponse<DriverEntity>>("/drivers", {
    params,
  });
  return adaptCursorToPaged(data, params.page, params.size);
}

export async function fetchDriver(id: number): Promise<DriverEntity> {
  const { data } = await api.get<DriverEntity>(`/drivers/${id}`);
  return data;
}

// 백엔드는 email/name/phone 만 받고 user 를 알아서 생성. role 은 자동 DRIVER.
// H-3: truckNumber 제거 — 트럭은 별도 truck 마스터로 관리.
// H-5: employmentKind/carrierId/payment_terms_*/default_truck_id/default_chassis_id/license/medical 추가.
import type { EmploymentKind, PaymentTermsKind } from "@/types";

export type DriverCreatePayload = {
  email: string;
  name: string;
  phone?: string | null;
  licenseNumber?: string | null;
  licenseState?: string | null;
  note?: string | null;
  employmentKind?: EmploymentKind;
  carrierId?: number | null;
  paymentTermsKind?: PaymentTermsKind | null;
  paymentTermsValue?: string | number | null;
  defaultTruckId?: number | null;
  defaultChassisId?: number | null;
  licenseExpiresAt?: string | null;
  medicalCertExpiresAt?: string | null;
};

export type DriverUpdatePayload = Partial<DriverCreatePayload> & {
  isActive?: boolean;
};

export async function createDriver(
  payload: DriverCreatePayload,
): Promise<DriverCreatedResponse> {
  const { data } = await api.post<DriverCreatedResponse>("/drivers", payload);
  return data;
}

export async function updateDriver(
  id: number,
  payload: DriverUpdatePayload,
): Promise<DriverEntity> {
  const { data } = await api.patch<DriverEntity>(`/drivers/${id}`, payload);
  return data;
}

export async function deleteDriver(id: number): Promise<void> {
  await api.delete(`/drivers/${id}`);
}
