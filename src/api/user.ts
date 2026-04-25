// /api/v1/users/* 매핑.
import api from "@/lib/axios";
import type { PagedResponse, UserEntity, UserRole } from "@/types";

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
): Promise<PagedResponse<UserEntity>> {
  const { data } = await api.get<PagedResponse<UserEntity>>("/users", {
    params,
  });
  return data;
}

export async function fetchUser(id: string): Promise<UserEntity> {
  const { data } = await api.get<UserEntity>(`/users/${id}`);
  return data;
}

export async function createUser(payload: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  phone?: string | null;
  tenantId?: string | null;
}): Promise<UserEntity> {
  const { data } = await api.post<UserEntity>("/users", payload);
  return data;
}

export async function updateUser(
  id: string,
  payload: Partial<{
    name: string;
    phone: string | null;
    isActive: boolean;
    role: UserRole;
  }>,
): Promise<UserEntity> {
  const { data } = await api.patch<UserEntity>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
