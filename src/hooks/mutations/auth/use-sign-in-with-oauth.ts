// OAuth 로그인 mutation. signInWithOAuth 가 popup 결과로 access(필수)+refresh(선택) 반환.
// 둘 다 있으면 setBootstrappedSession, access 만 있으면 access 박고 fetchMe 후 setUser.
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signInWithOAuth } from "@/api/auth";
import { fetchMe } from "@/api/user";
import { announceLogin } from "@/lib/auth-broadcast";
import {
  setAccessTokenModule,
  setBootstrappedSession,
  setUser,
} from "@/store/auth";
import type { UseMutationCallback } from "@/types";

export function useSignInWithOAuth(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signInWithOAuth,
    onSuccess: async (data) => {
      queryClient.clear();
      if (data.refreshToken) {
        // refresh 까지 받았으면 한 번에 세팅.
        setAccessTokenModule(data.accessToken);
        const me = await fetchMe();
        setBootstrappedSession({
          user: me,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        announceLogin(String(me.id));
      } else {
        // access only — refresh 는 HttpOnly 쿠키 또는 서버 세션이 들고 있는 케이스.
        setAccessTokenModule(data.accessToken);
        const me = await fetchMe();
        setUser(me);
        announceLogin(String(me.id));
      }
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
