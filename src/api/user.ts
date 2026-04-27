// /api/v1/users/* 매핑.
//
// SUPER_ADMIN 은 user.teamId 가 null 이라 team 컨텍스트 없음.
// 특정 team 의 사용자를 조회/생성/수정/삭제하려면 X-Team-Id 헤더 필수.
// 일반 유저(ADMIN/DISPATCHER)는 teamId 생략 → 자동으로 자기 team.
import api from "@/lib/axios";
import type { PagedResponse, UserEntity, UserRole } from "@/types";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";

function teamHeaders(teamId?: number) {
  return teamId ? { "X-Team-Id": teamId } : undefined;
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
  teamId?: number,
): Promise<PagedResponse<UserEntity>> {
  const { data } = await api.get<CursorResponse<UserEntity>>("/users", {
    params,
    headers: teamHeaders(teamId),
  });
  return adaptCursorToPaged(data, params?.page, params?.size);
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
    teamId?: number | null;
  },
  teamId?: number,
): Promise<UserEntity> {
  const { data } = await api.post<UserEntity>("/users", payload, {
    headers: teamHeaders(teamId),
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
  teamId?: number,
): Promise<UserEntity> {
  const { data } = await api.patch<UserEntity>(`/users/${id}`, payload, {
    headers: teamHeaders(teamId),
  });
  return data;
}

export async function deleteUser(id: number, teamId?: number): Promise<void> {
  await api.delete(`/users/${id}`, {
    headers: teamHeaders(teamId),
  });
}
