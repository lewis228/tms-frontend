// ProtectedRoute — 인증/역할 가드 + 온보딩 redirect.
//
// 사용:
//   <Route element={<ProtectedRoute />}>          // 인증만
//   <Route element={<ProtectedRoute require="ADMIN" />}>  // ADMIN+ 만
//
// 동작:
// - 부트스트랩 미완 → GlobalLoader 표시.
// - user 없음 → /sign-in 리다이렉트 (state: 원래 경로).
// - role 부족 → /forbidden 리다이렉트.
// - 현재 tenant 의 onboarding_completed=false → /app/onboarding 으로 redirect
//   (단 이미 /app/onboarding 인 경우는 통과)
// - 통과 → <Outlet />.
import { Navigate, Outlet, useLocation } from "react-router-dom";

import GlobalLoader from "@/components/global-loader";
import { hasAccess } from "@/lib/nav-config";
import {
  useCurrentTenantId,
  useCurrentUser,
  useIsBootstrapped,
} from "@/store/auth";
import type { UserRole } from "@/types";

type Props = { require?: UserRole };

const ONBOARDING_PATH = "/app/onboarding";

export default function ProtectedRoute({ require }: Props) {
  const isBootstrapped = useIsBootstrapped();
  const user = useCurrentUser();
  const tenantId = useCurrentTenantId();
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

  // 온보딩 미완 → wizard 로. SUPER_ADMIN 은 멤버십 없으니 제외, DRIVER 도 데스크톱 미사용.
  if (
    tenantId &&
    user.role !== "SUPER_ADMIN" &&
    user.role !== "DRIVER" &&
    location.pathname !== ONBOARDING_PATH
  ) {
    const membership = user.tenants.find((t) => t.tenantId === tenantId);
    if (membership && !membership.onboardingCompleted) {
      return <Navigate to={ONBOARDING_PATH} replace />;
    }
  }

  return <Outlet />;
}
