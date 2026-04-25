// Auth store — 단일 진실 (user / tenantId / role / accessToken / refreshToken).
//
// 보안 절충 (D 결정):
// - access token 은 메모리 (Zustand state) — XSS 노출 시간 최소화.
// - refresh token 은 localStorage 에 persist — 새로고침 후 재로그인 회피.
// - persist 미들웨어가 refresh / userId 만 저장 (`partialize`).
// - 새로고침 시 부트스트랩 단계가 refresh 로 새 access 받고 /users/me 호출 → user 복원.
//
// API:
// - useAuthAccessToken(): 현재 access token (없으면 null)
// - useCurrentUser(): { user, role, tenantId }
// - useAuthActions(): { setSession, setAccessToken, clear, setUser }
// - getAccessToken() / setAccessToken() — 모듈 호출 (axios interceptor 등 React 밖 에서)
import { create } from "zustand";
import { combine, devtools, persist, createJSONStorage } from "zustand/middleware";

import type { UserEntity, UserRole } from "@/types";

type State = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserEntity | null;
  isBootstrapped: boolean;
};

const initial: State = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isBootstrapped: false,
};

const useAuthStore = create(
  devtools(
    persist(
      combine(initial, (set) => ({
        actions: {
          setTokens: (accessToken: string, refreshToken: string) =>
            set({ accessToken, refreshToken }),
          setAccessToken: (accessToken: string) => set({ accessToken }),
          setUser: (user: UserEntity | null) => set({ user }),
          setSession: (params: {
            user: UserEntity;
            accessToken: string;
            refreshToken: string;
          }) =>
            set({
              user: params.user,
              accessToken: params.accessToken,
              refreshToken: params.refreshToken,
              isBootstrapped: true,
            }),
          markBootstrapped: () => set({ isBootstrapped: true }),
          clear: () =>
            set({
              accessToken: null,
              refreshToken: null,
              user: null,
              isBootstrapped: true,
            }),
        },
      })),
      {
        name: "tms-auth",
        storage: createJSONStorage(() => localStorage),
        // refresh 만 persist. access 는 메모리, user 는 부트스트랩 시 /users/me 로 갱신.
        partialize: (s) => ({ refreshToken: s.refreshToken }),
      },
    ),
    { name: "AuthStore" },
  ),
);

// React 훅
export const useAuthAccessToken = () => useAuthStore((s) => s.accessToken);
export const useAuthRefreshToken = () => useAuthStore((s) => s.refreshToken);
export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useCurrentRole = () => useAuthStore((s) => s.user?.role ?? null);
export const useCurrentTenantId = () => useAuthStore((s) => s.user?.tenantId ?? null);
export const useIsBootstrapped = () => useAuthStore((s) => s.isBootstrapped);
export const useAuthActions = () => useAuthStore((s) => s.actions);

// 모듈 호출 — axios interceptor / WebSocket adapter 등 React 밖 에서.
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}
export function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}
export function setAccessTokenModule(token: string): void {
  useAuthStore.getState().actions.setAccessToken(token);
}
export function setTokensModule(access: string, refresh: string): void {
  useAuthStore.getState().actions.setTokens(access, refresh);
}
export function clearAuth(): void {
  useAuthStore.getState().actions.clear();
}
export function getCurrentUser(): UserEntity | null {
  return useAuthStore.getState().user;
}
export function getCurrentTenantIdModule(): string | null {
  return useAuthStore.getState().user?.tenantId ?? null;
}
export function getCurrentRoleModule(): UserRole | null {
  return useAuthStore.getState().user?.role ?? null;
}

// 부트스트랩에서 사용
export function setBootstrappedSession(params: {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}) {
  useAuthStore.getState().actions.setSession(params);
}
export function setUser(user: UserEntity | null) {
  useAuthStore.getState().actions.setUser(user);
}
export function markBootstrapped() {
  useAuthStore.getState().actions.markBootstrapped();
}

// 외부 모듈에서 store subscribe (axios refresh 등)
export const authStore = useAuthStore;
