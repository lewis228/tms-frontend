// /app/:tenantId 하위 라우트의 셸 + tenant 가드.
//
// ste 의 TeamScopedLayout 패턴:
//  - URL `:tenantId` 를 단일 진실로. mount 시 auth store currentTenantId 로 동기화.
//  - SUPER_ADMIN 은 멤버십 없이 임의 tenant 로 진입 가능 (시스템 관리자).
//  - 비-SUPER_ADMIN 이 멤버 아닌 tenant 로 들어오면 /app 으로 redirect.
//  - parsedTenantId 가 NaN 이면 즉시 /app.
//
// 셸: 사이드바 + 헤더 + 메인 (이전 app-layout 의 역할 그대로 흡수).
import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

import AppHeader from "@/components/layout/app-header";
import Sidebar from "@/components/layout/sidebar";
import {
  useAuthActions,
  useCurrentRole,
  useCurrentUser,
} from "@/store/auth";

export default function TenantScopedLayout() {
  const params = useParams();
  const user = useCurrentUser();
  const role = useCurrentRole();
  const { setCurrentTenantId } = useAuthActions();

  const parsedTenantId = params.tenantId ? Number(params.tenantId) : NaN;
  const isValid = Number.isFinite(parsedTenantId);
  const isMember =
    isValid && (user?.tenants.some((m) => m.tenantId === parsedTenantId) ?? false);
  const allowed = isValid && (role === "SUPER_ADMIN" || isMember);

  useEffect(() => {
    if (allowed) setCurrentTenantId(parsedTenantId);
  }, [allowed, parsedTenantId, setCurrentTenantId]);

  if (!allowed) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
