// /app — tenant picker / auto-redirect.
//
// 1) 일반 사용자 (DRIVER/DISPATCHER/ADMIN):
//    - tenants 1개 → /app/{id}/dashboard 로 자동 redirect.
//    - 0개 → 빈 상태 (관리자에게 초대 요청 안내).
//    - 2개 이상 → 멤버십에서 picker.
// 2) SUPER_ADMIN:
//    - 멤버십 1개 → 자동 redirect.
//    - 멤버십이 비어있으면 listTenants() 로 전체 tenant 목록 picker.
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import GlobalLoader from "@/components/global-loader";
import { Navigate } from "react-router-dom";
import { listTenants } from "@/api/tenant";
import { QUERY_KEYS } from "@/lib/constants";
import { useCurrentRole, useCurrentUser } from "@/store/auth";

export default function AppHomePage() {
  const user = useCurrentUser();
  const role = useCurrentRole();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isSuperAdmin = role === "SUPER_ADMIN";
  const memberships = user?.tenants ?? [];

  const { data: allTenants, isPending: isAllTenantsPending } = useQuery({
    queryKey: QUERY_KEYS.tenant.list,
    queryFn: listTenants,
    enabled: isSuperAdmin && memberships.length === 0,
  });

  if (!user) return <Navigate to="/sign-in" replace />;

  // 멤버십 1개면 무조건 그 tenant 로 진입.
  if (memberships.length === 1) {
    return <Navigate to={`/app/${memberships[0].tenantId}`} replace />;
  }

  // SUPER_ADMIN 이고 멤버십 비었으면 전체 tenant 목록.
  const showAllTenants = isSuperAdmin && memberships.length === 0;

  if (showAllTenants && isAllTenantsPending) {
    return <GlobalLoader />;
  }

  const pickerItems = showAllTenants
    ? (allTenants ?? []).map((t) => ({ id: t.id, name: t.name }))
    : memberships.map((m) => ({ id: m.tenantId, name: m.tenantName ?? `#${m.tenantId}` }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-2xl font-semibold">
            {t("pages.appHome.title", "TMS Pro")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pickerItems.length === 0
              ? t(
                  "pages.appHome.noTenants",
                  "소속된 회사가 없습니다. 관리자에게 초대를 요청하세요.",
                )
              : t("pages.appHome.pickTenant", "들어갈 회사를 선택하세요")}
          </p>
        </div>

        {pickerItems.length > 0 && (
          <div className="flex flex-col gap-2">
            {pickerItems.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(`/app/${p.id}`)}
                className="flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground">
                  {t("pages.appHome.enterTenant", "들어가기 →")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
