// 부트스트랩 — 앱 시작 시 1회 실행.
//
// 동작 (web):
// - 항상 /auth/token/access 시도 — refresh 토큰은 HttpOnly 쿠키에 있으므로
//   JS 가 읽어 분기할 수 없다. 쿠키가 없으면 401, 있으면 새 access 발급.
// - 성공 → /users/me → setUser.
// - 실패 → clearAuth (비인증 상태로 sign-in 으로 가게 됨).
// - 어느 경우든 markBootstrapped 로 가드들이 동작 가능하게.
import { useEffect } from "react";

import { fetchMe } from "@/api/user";
import { refreshAccessToken } from "@/lib/axios";
import {
  clearAuth,
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
