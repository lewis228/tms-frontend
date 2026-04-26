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

export async function fetchDrivers(
  params: {
    page?: number;
    size?: number;
    activeOnly?: boolean;
    q?: string;
  } = {},
): Promise<PagedResponse<DriverEntity>> {
  const { data } = await api.get<PagedResponse<DriverEntity>>("/drivers", {
    params,
  });
  return data;
}

export async function fetchDriver(id: string): Promise<DriverEntity> {
  const { data } = await api.get<DriverEntity>(`/drivers/${id}`);
  return data;
}

// 백엔드는 email/name/phone 만 받고 user 를 알아서 생성. role 은 자동 DRIVER.
export async function createDriver(payload: {
  email: string;
  name: string;
  phone?: string | null;
  licenseNumber?: string | null;
  licenseState?: string | null;
  truckNumber?: string | null;
  note?: string | null;
}): Promise<DriverCreatedResponse> {
  const { data } = await api.post<DriverCreatedResponse>("/drivers", payload);
  return data;
}

export async function updateDriver(
  id: string,
  payload: Partial<{
    name: string;
    phone: string | null;
    licenseNumber: string | null;
    licenseState: string | null;
    truckNumber: string | null;
    isActive: boolean;
    note: string | null;
  }>,
): Promise<DriverEntity> {
  const { data } = await api.patch<DriverEntity>(`/drivers/${id}`, payload);
  return data;
}

export async function deleteDriver(id: string): Promise<void> {
  await api.delete(`/drivers/${id}`);
}
