// /teams/* 매핑.
//
// "현재 사용자의 team" 조회는 /users/me 응답의 user.teams 배열 사용.
// 특정 team 디테일이 필요하면 fetchTeam(id).
import api from "@/lib/axios";
import type { TeamEntity } from "@/types";

export async function listTeams(): Promise<TeamEntity[]> {
  const { data } = await api.get<TeamEntity[]>("/teams");
  return data;
}

export async function fetchTeam(id: number): Promise<TeamEntity> {
  const { data } = await api.get<TeamEntity>(`/teams/${id}`);
  return data;
}

// 백엔드 TeamCreateRequest / TeamUpdateRequest 와 1:1 매핑.
export type TeamWritePayload = {
  name: string;
  companyName?: string | null;
  registrationNumber?: string | null;
  representativeName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  memo?: string | null;
  timezone?: string | null;
  currency?: string | null;
};

export async function createTeam(payload: TeamWritePayload): Promise<TeamEntity> {
  const { data } = await api.post<TeamEntity>("/teams", payload);
  return data;
}

export async function updateTeam(
  id: number,
  payload: Partial<TeamWritePayload & { isActive: boolean }>,
): Promise<TeamEntity> {
  const { data } = await api.patch<TeamEntity>(`/teams/${id}`, payload);
  return data;
}

export async function deleteTeam(id: number): Promise<void> {
  await api.delete(`/teams/${id}`);
}

// ── 온보딩 ─────────────────────────────────────────────────
// PATCH /teams/{id}/onboarding — 단계별 플래그 토글 / 완료 처리.
export type OnboardingPatch = {
  step1Done?: boolean;
  step2Done?: boolean;
  step3Done?: boolean;
  completed?: boolean;
};

export async function updateOnboarding(
  teamId: number,
  payload: OnboardingPatch,
): Promise<{ ok: boolean }> {
  const { data } = await api.patch<{ ok: boolean }>(
    `/teams/${teamId}/onboarding`,
    payload,
  );
  return data;
}

// ── 멤버 초대 ─────────────────────────────────────────────────
// POST /teams/{teamId}/members — 백엔드는 user_id 를 받는다 (이미 가입된 계정만 초대).
// 응답: TeamMemberInviteResponseSchema { teamId, userId, object, invited, permissionGroupId }
export type TeamMemberInviteResponse = {
  teamId: number;
  userId: number;
  object: "team_member";
  invited: boolean;
  permissionGroupId: number | null;
};

export async function inviteMember(
  teamId: number,
  payload: { userId: number; permissionGroupId?: number | null },
): Promise<TeamMemberInviteResponse> {
  const { data } = await api.post<TeamMemberInviteResponse>(
    `/teams/${teamId}/members`,
    payload,
  );
  return data;
}
