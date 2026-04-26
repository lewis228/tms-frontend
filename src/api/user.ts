// /api/v1/users/* 매핑.
//
// SUPER_ADMIN 은 user.tenantId 가 null 이라 tenant 컨텍스트 없음.
// 특정 tenant 의 사용자를 조회/생성/수정/삭제하려면 X-Tenant-Id 헤더 필수.
// 일반 유저(ADMIN/DISPATCHER)는 tenantId 생략 → 자동으로 자기 tenant.
import api from "@/lib/axios";
import type { PagedResponse, UserEntity, UserRole } from "@/types";

function tenantHeaders(tenantId?: number) {
  return tenantId ? { "X-Tenant-Id": tenantId } : undefined;
}

export async function fetchMe(): Promise<UserEntity> {
  const { data } = await api.get<UserEntity>("/users/me");
  return data;
}

export async function changeMyPassword(payload: {
  currentPassword?: string;
  newPassword: string;
}): Promise<UserEntity> {
  const { data } = await api.patch<UserEntity>("/users/me/password", payload);
  return data;
}

export async function listUsers(
  params: { page?: number; size?: number } = {},
  tenantId?: number,
): Promise<PagedResponse<UserEntity>> {
  const { data } = await api.get<PagedResponse<UserEntity>>("/users", {
    params,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function fetchUser(id: number): Promise<UserEntity> {
  const { data } = await api.get<UserEntity>(`/users/${id}`);
  return data;
}

export async function createUser(
  payload: {
    email: string;
    name: string;
    password: string;
    role: UserRole;
    phone?: string | null;
    tenantId?: number | null;
  },
  tenantId?: number,
): Promise<UserEntity> {
  const { data } = await api.post<UserEntity>("/users", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateUser(
  id: number,
  payload: Partial<{
    name: string;
    phone: string | null;
    isActive: boolean;
    role: UserRole;
  }>,
  tenantId?: number,
): Promise<UserEntity> {
  const { data } = await api.patch<UserEntity>(`/users/${id}`, payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function deleteUser(id: number, tenantId?: number): Promise<void> {
  await api.delete(`/users/${id}`, {
    headers: tenantHeaders(tenantId),
  });
}
