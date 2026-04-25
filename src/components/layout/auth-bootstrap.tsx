// 부트스트랩 — 앱 시작 시 1회 실행.
//
// 동작:
// - refresh token 이 localStorage 에 없으면 즉시 markBootstrapped (비인증 상태).
// - refresh 있으면 /api/v1/auth/refresh → 새 access token 받고 /api/v1/users/me 호출.
// - 어느 단계든 실패하면 clear() + markBootstrapped (sign-in 으로 가게 됨).
import { useEffect } from "react";

import { fetchMe } from "@/api/user";
import { refreshAccessToken } from "@/lib/axios";
import {
  clearAuth,
  getRefreshToken,
  markBootstrapped,
  setUser,
  useIsBootstrapped,
} from "@/store/auth";

export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const isBootstrapped = useIsBootstrapped();

  useEffect(() => {
    if (isBootstrapped) return;
    let cancelled = false;
    (async () => {
      const refresh = getRefreshToken();
      if (!refresh) {
        markBootstrapped();
        return;
      }
      try {
        await refreshAccessToken();
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) markBootstrapped();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isBootstrapped]);

  return <>{children}</>;
}
