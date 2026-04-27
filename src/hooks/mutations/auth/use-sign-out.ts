// 로그아웃 mutation. 백엔드 세션 무효화 → 로컬 store clear → 다른 탭 announceLogout.
// 백엔드 호출이 실패해도 클라이언트는 로그아웃 처리 (try/catch 흡수).
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signOut } from "@/api/auth";
import { announceLogout } from "@/lib/auth-broadcast";
import { clearAuth } from "@/store/auth";
import type { UseMutationCallback } from "@/types";

export function useSignOut(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      announceLogout();
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      // 백엔드 실패해도 클라이언트는 로그아웃 시켜야 한다.
      clearAuth();
      queryClient.clear();
      announceLogout();
      callbacks?.onError?.(error);
    },
  });
}
