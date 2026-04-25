// 라우트 트리.
//
// 영역:
// - Public: /, /forbidden, /maintenance (가드 없음)
// - Guest: /sign-in (로그인 상태면 /app/dashboard 로 redirect)
// - Member: /app/* (ProtectedRoute + AppLayout — 비로그인 → /sign-in, role 부족 → /forbidden)
//
// 페이지 자체는 Phase 2 placeholder. Phase 3+ 에서 실제 컨텐츠 추가.
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import GlobalLoader from "@/components/global-loader";
import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import AppLayout from "@/components/layout/app-layout";
import ProtectedRoute from "@/components/layout/protected-route";

const SignInPage = lazy(() => import("@/pages/sign-in-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));
const ForbiddenPage = lazy(() => import("@/pages/forbidden-page"));
const MaintenancePage = lazy(() => import("@/pages/maintenance-page"));
const LandingLayout = lazy(() => import("@/pages/landing/landing-layout"));
const LandingPage = lazy(() => import("@/pages/landing/landing-page"));
const MasterVesselsPage = lazy(() => import("@/pages/master-vessels-page"));
const MasterTerminalsPage = lazy(() => import("@/pages/master-terminals-page"));
const MasterLocationsPage = lazy(() => import("@/pages/master-locations-page"));
const MasterCustomersPage = lazy(() => import("@/pages/master-customers-page"));
const MasterDriversPage = lazy(() => import("@/pages/master-drivers-page"));
const DeliveryOrdersPage = lazy(() => import("@/pages/delivery-orders-page"));

function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-2 p-6">
      <h1 className="text-2xl font-semibold">{name}</h1>
      <p className="text-sm text-muted-foreground">Phase 3+ 에서 구현.</p>
    </div>
  );
}

export default function RootRoute() {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <Routes>
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />

        <Route element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        <Route element={<GuestOnlyLayout />}>
          <Route path="/sign-in" element={<SignInPage />} />
        </Route>

        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            <Route element={<ProtectedRoute require="DISPATCHER" />}>
              <Route
                path="dispatch"
                element={<Placeholder name="Dispatch" />}
              />
              <Route
                path="dispatch/drivers"
                element={<Placeholder name="Driver Schedule" />}
              />
              <Route path="delivery-orders" element={<DeliveryOrdersPage />} />
            </Route>

            <Route element={<ProtectedRoute require="DISPATCHER" />}>
              <Route
                path="accounting"
                element={<Placeholder name="Settlements" />}
              />
            </Route>
            <Route element={<ProtectedRoute require="ADMIN" />}>
              <Route
                path="accounting/rates"
                element={<Placeholder name="Rate Settings" />}
              />
            </Route>

            <Route path="master/customers" element={<MasterCustomersPage />} />
            <Route path="master/drivers" element={<MasterDriversPage />} />
            <Route path="master/terminals" element={<MasterTerminalsPage />} />
            <Route path="master/vessels" element={<MasterVesselsPage />} />
            <Route path="master/locations" element={<MasterLocationsPage />} />

            <Route element={<ProtectedRoute require="SUPER_ADMIN" />}>
              <Route
                path="system/tenants"
                element={<Placeholder name="System / Tenants" />}
              />
              <Route
                path="system/users"
                element={<Placeholder name="System / Users" />}
              />
            </Route>

            <Route element={<ProtectedRoute require="ADMIN" />}>
              <Route
                path="settings/tenant"
                element={<Placeholder name="Settings / Tenant" />}
              />
              <Route
                path="settings/members"
                element={<Placeholder name="Settings / Members" />}
              />
            </Route>
            <Route
              path="settings/theme"
              element={<Placeholder name="Settings / Theme" />}
            />
            <Route
              path="settings/notifications"
              element={<Placeholder name="Settings / Notifications" />}
            />
            <Route
              path="settings/privacy"
              element={<Placeholder name="Settings / Privacy" />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
