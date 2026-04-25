// ProtectedRoute — 인증/역할 가드.
//
// 사용:
//   <Route element={<ProtectedRoute />}>          // 인증만
//   <Route element={<ProtectedRoute require="ADMIN" />}>  // ADMIN+ 만
//
// 동작:
// - 부트스트랩 미완 → GlobalLoader 표시.
// - user 없음 → /sign-in 리다이렉트 (state: 원래 경로).
// - role 부족 → /forbidden 리다이렉트.
// - 통과 → <Outlet />.
import { Navigate, Outlet, useLocation } from "react-router-dom";

import GlobalLoader from "@/components/global-loader";
import { hasAccess } from "@/lib/nav-config";
import { useCurrentUser, useIsBootstrapped } from "@/store/auth";
import type { UserRole } from "@/types";

type Props = { require?: UserRole };

export default function ProtectedRoute({ require }: Props) {
  const isBootstrapped = useIsBootstrapped();
  const user = useCurrentUser();
  const location = useLocation();

  if (!isBootstrapped) return <GlobalLoader />;
  if (!user) {
    return (
      <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
    );
  }
  if (!hasAccess(user.role, require)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Outlet />;
}
