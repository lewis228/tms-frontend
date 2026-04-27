// 이메일/비밀번호 로그인 mutation. 백엔드는 LoginResponse (access + refresh) 반환.
// onSuccess: 토큰을 먼저 store 에 박고 /users/me 호출 → setBootstrappedSession.
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signIn } from "@/api/auth";
import { fetchMe } from "@/api/user";
import { announceLogin } from "@/lib/auth-broadcast";
import { setBootstrappedSession, setTokensModule } from "@/store/auth";
import type { UseMutationCallback } from "@/types";

export function useSignInWithPassword(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signIn,
    onSuccess: async (data) => {
      // 백엔드(웹)는 refresh 를 HttpOnly 쿠키로만 송신 → body 의 refreshToken 은 null 가능.
      const refreshToken = data.refreshToken ?? "";
      // axios 인터셉터가 /users/me 호출 시 Bearer 헤더를 붙이도록 토큰을 먼저 store 에 박는다.
      setTokensModule(data.accessToken, refreshToken);
      queryClient.clear();
      const me = await fetchMe();
      setBootstrappedSession({
        user: me,
        accessToken: data.accessToken,
        refreshToken,
      });
      announceLogin(String(me.id));
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
