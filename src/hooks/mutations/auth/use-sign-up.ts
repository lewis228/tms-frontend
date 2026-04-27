// 회원가입 mutation. 검증된 requestId 와 함께 계정 생성 후 자동 로그인.
// 응답은 LoginResponse (access + refresh).
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signUp } from "@/api/auth";
import { fetchMe } from "@/api/user";
import { announceLogin } from "@/lib/auth-broadcast";
import { setBootstrappedSession, setTokensModule } from "@/store/auth";
import type { UseMutationCallback } from "@/types";

export function useSignUp(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signUp,
    onSuccess: async (data) => {
      const refreshToken = data.refreshToken ?? "";
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
