// /app/:tenantId 하위 라우트의 셸 + tenant 가드.
//
// ste 의 TeamScopedLayout 패턴을 그대로 가져왔다:
//  - URL `:tenantId` 를 단일 진실로. mount 시 auth store currentTenantId 로 동기화.
//  - SUPER_ADMIN 은 멤버십 없이 임의 tenant 로 진입 가능 (시스템 관리자).
//  - 비-SUPER_ADMIN 이 멤버 아닌 tenant 로 들어오면 /app 으로 redirect.
//  - parsedTenantId 가 NaN 이면 즉시 /app.
//
// 셸 (사이드바 + 헤더 + 메인 + 우측 패널 + 리사이즈 핸들):
//   ┌─────────┬─────────────────────────┬───────────┐
//   │         │ Header (shrink-0)       │           │
//   │ Sidebar │─────────────────────────│ RightPanel│
//   │ (scroll │ Main (flex-1, scrolls)  │ (scroll)  │
//   └─────────┴─────────────────────────┴───────────┘
import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import RightPanel from "@/components/layout/right-panel";
import RightPanelResizeHandle from "@/components/layout/right-panel-resize-handle";
import {
  useIsRightPanelCollapsed,
  useRightPanelWidth,
} from "@/store/right-panel";
import {
  useAuthActions,
  useCurrentRole,
  useCurrentUser,
} from "@/store/auth";
import { LAYOUT } from "@/lib/layout-constants";

export default function TenantScopedLayout() {
  const params = useParams();
  const user = useCurrentUser();
  const role = useCurrentRole();
  const navigate = useNavigate();
  const { setCurrentTenantId } = useAuthActions();
  const isRightPanelCollapsed = useIsRightPanelCollapsed();
  const rightPanelWidth = useRightPanelWidth();
  const [isResizing, setIsResizing] = useState(false);
  const { t } = useTranslation();

  const parsedTenantId = params.tenantId ? Number(params.tenantId) : NaN;
  const isValid = Number.isFinite(parsedTenantId);
  const isMember =
    isValid && (user?.tenants.some((m) => m.tenantId === parsedTenantId) ?? false);
  const allowed = isValid && (role === "SUPER_ADMIN" || isMember);

  useEffect(() => {
    if (allowed) setCurrentTenantId(parsedTenantId);
  }, [allowed, parsedTenantId, setCurrentTenantId]);

  // Listen for the global "tenant:not-member" event (raised by api/* layers
  // when the server signals NOT_TENANT_MEMBER). Toast + bounce to /app.
  useEffect(() => {
    const handler = () => {
      toast.error(t("errors.NOT_TEAM_MEMBER"), { position: "top-center" });
      setCurrentTenantId(null);
      navigate("/app", { replace: true });
    };
    window.addEventListener("tenant:not-member", handler);
    return () => window.removeEventListener("tenant:not-member", handler);
  }, [navigate, setCurrentTenantId, t]);

  if (!allowed) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />

      {/* `min-w-0` lets the middle column shrink below its content's
          natural width. Without it, flex items refuse to shrink and wide
          children push the right panel off-screen. */}
      <div className="flex flex-1 min-w-0 flex-col">
        <Header />
        {/* `overflow-x-auto` lets wide tables trigger horizontal scroll
            within the content area rather than clipping. The inner
            min-width wrapper guarantees every page has a sensible floor.
            `[&_[data-slot=table-container]]:overflow-visible` neutralises
            the shadcn Table's internal overflow-x-auto so the main column
            owns the ONLY horizontal scrollbar. */}
        <main className="flex-1 overflow-x-auto overflow-y-auto [&_[data-slot=table-container]]:overflow-visible">
          <div
            className="h-full"
            style={{ minWidth: `${LAYOUT.defaultMinWidth}px` }}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {!isRightPanelCollapsed && (
        <RightPanelResizeHandle onResizingChange={setIsResizing} />
      )}

      <aside
        className="h-full shrink-0 overflow-hidden"
        style={{
          width: isRightPanelCollapsed ? 0 : rightPanelWidth,
          transition: isResizing ? "none" : "width 300ms ease",
        }}
      >
        <RightPanel />
      </aside>

      {/* TMS: drayage-specific overlays go here later */}
    </div>
  );
}
