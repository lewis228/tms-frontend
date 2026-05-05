// 라우트 트리 — ste 패턴.
//
// 영역:
// - Public: /forbidden, /maintenance (가드 없음)
// - Marketing: / (LandingLayout — 비로그인/로그인 모두 접근)
// - Guest: /sign-in (로그인 상태면 /app 으로 redirect)
// - Member: /app/* (ProtectedRoute)
//   - /app             → AppHomePage (team picker / auto-redirect)
//   - /app/:teamId/* → TeamScopedLayout (사이드바 + 헤더 셸 + 멤버십 가드)
//
// 모든 페이지 lazy. 단일 Suspense 가 전 페이지 로딩을 GlobalLoader 로 가린다.
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import GlobalLoader from "@/components/global-loader";
import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import TeamScopedLayout from "@/components/layout/team-scoped-layout";

const SignInPage = lazy(() => import("@/pages/sign-in-page"));
const SignUpPage = lazy(() => import("@/pages/sign-up-page"));
const ForgetPasswordPage = lazy(() => import("@/pages/forget-password-page"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password-page"));
const TwoStepVerificationPage = lazy(
  () => import("@/pages/two-step-verification-page"),
);
const ChooseAccountTypePage = lazy(
  () => import("@/pages/choose-account-type-page"),
);
const AccountInfoPage = lazy(() => import("@/pages/account-info-page"));
const BillingDetailsPage = lazy(() => import("@/pages/billing-details-page"));
const BillingCardPage = lazy(() => import("@/pages/billing-card-page"));
const OAuthCallbackPage = lazy(() => import("@/pages/oauth-callback-page"));
const AppHomePage = lazy(() => import("@/pages/app-home-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));
const ForbiddenPage = lazy(() => import("@/pages/forbidden-page"));
const MaintenancePage = lazy(() => import("@/pages/maintenance-page"));
const LandingLayout = lazy(() => import("@/pages/landing/landing-layout"));
const LandingPage = lazy(() => import("@/pages/landing/landing-page"));
const AboutPage = lazy(() => import("@/pages/landing/about-page"));
const ServicesPage = lazy(() => import("@/pages/landing/services-page"));
const ServiceDetailPage = lazy(() => import("@/pages/landing/service-detail-page"));
const ContactPage = lazy(() => import("@/pages/landing/contact-page"));
const ComingSoonPage = lazy(() => import("@/pages/coming-soon-page"));
const MobileComingSoonPage = lazy(
  () => import("@/pages/mobile-coming-soon-page"),
);
const MasterVesselsPage = lazy(() => import("@/pages/master-vessels-page"));
const MasterTerminalsPage = lazy(() => import("@/pages/master-terminals-page"));
const MasterLocationsPage = lazy(() => import("@/pages/master-locations-page"));
const MasterCustomersPage = lazy(() => import("@/pages/master-customers-page"));
const MasterDriversPage = lazy(() => import("@/pages/master-drivers-page"));
const MasterTrucksPage = lazy(() => import("@/pages/master-trucks-page"));
const MasterChassisPage = lazy(() => import("@/pages/master-chassis-page"));
const MasterEquipmentPoolsPage = lazy(() => import("@/pages/master-equipment-pools-page"));
const MasterChargeCodesPage = lazy(() => import("@/pages/master-charge-codes-page"));
const MasterRateTariffsPage = lazy(() => import("@/pages/master-rate-tariffs-page"));
const MasterRateQuotesPage = lazy(() => import("@/pages/master-rate-quotes-page"));
const MasterDistanceMatrixPage = lazy(() => import("@/pages/master-distance-matrix-page"));
const MasterRateCardsPage = lazy(() => import("@/pages/master-rate-cards-page"));
const DeliveryOrdersPage = lazy(() => import("@/pages/delivery-orders-page"));
const DeliveryOrderDetailPage = lazy(() => import("@/pages/delivery-order-detail-page"));
const StreetTurnsPage = lazy(() => import("@/pages/street-turns-page"));
const OnboardingPage = lazy(() => import("@/pages/onboarding-page"));
const DispatchPage = lazy(() => import("@/pages/dispatch-page"));
const ContainerDetailPage = lazy(() => import("@/pages/container-detail-page"));
const DriverSchedulePage = lazy(() => import("@/pages/driver-schedule-page"));
const AccountingPage = lazy(() => import("@/pages/accounting-page"));
const AccountingRatesPage = lazy(
  () => import("@/pages/accounting-rates-page"),
);
const SystemTeamsPage = lazy(() => import("@/pages/system-teams-page"));
const SystemUsersPage = lazy(() => import("@/pages/system-users-page"));
const NotificationsPage = lazy(() => import("@/pages/notifications-page"));
const SettingsTeamPage = lazy(() => import("@/pages/settings-team-page"));
const SettingsMembersPage = lazy(() => import("@/pages/settings-members-page"));
const SettingsThemePage = lazy(() => import("@/pages/settings-theme-page"));
const SettingsNotificationsPage = lazy(
  () => import("@/pages/settings-notifications-page"),
);
const SettingsPrivacyPage = lazy(() => import("@/pages/settings-privacy-page"));
const SettingsTagsPage = lazy(() => import("@/pages/settings-tags-page"));
const SettingsPluginsPage = lazy(() => import("@/pages/settings-plugins-page"));
const SettingsPaymentPage = lazy(() => import("@/pages/settings-payment-page"));
const ApiKeysPage = lazy(() => import("@/pages/api-keys-page"));

export default function RootRoute() {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <Routes>
        {/* Public — 가드 없음. */}
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route
          path="/mobile-coming-soon"
          element={<MobileComingSoonPage />}
        />

        {/* Marketing — 랜딩. */}
        <Route element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Guest — 로그인 상태면 /app 으로. */}
        <Route element={<GuestOnlyLayout />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forget-password" element={<ForgetPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/two-step-verification"
            element={<TwoStepVerificationPage />}
          />
          <Route
            path="/choose-account-type"
            element={<ChooseAccountTypePage />}
          />
          <Route path="/account-info" element={<AccountInfoPage />} />
          <Route path="/billing-details" element={<BillingDetailsPage />} />
          <Route path="/billing-card" element={<BillingCardPage />} />
        </Route>

        {/* Member — 인증 필수. */}
        <Route path="/app" element={<ProtectedRoute />}>
          {/* /app — team picker / 자동 redirect */}
          <Route index element={<AppHomePage />} />

          {/* /app/:teamId/* — 셸 + team 가드 */}
          <Route path=":teamId" element={<TeamScopedLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />

            <Route element={<ProtectedRoute require="DISPATCHER" />}>
              <Route path="dispatch" element={<DispatchPage />} />
              <Route path="dispatch/drivers" element={<DriverSchedulePage />} />
              <Route path="delivery-orders" element={<DeliveryOrdersPage />} />
              <Route
                path="delivery-orders/:id"
                element={<DeliveryOrderDetailPage />}
              />
              <Route
                path="containers/:id"
                element={<ContainerDetailPage />}
              />
              <Route path="street-turns" element={<StreetTurnsPage />} />
            </Route>

            <Route element={<ProtectedRoute require="DISPATCHER" />}>
              <Route path="accounting" element={<AccountingPage />} />
            </Route>
            <Route element={<ProtectedRoute require="ADMIN" />}>
              <Route path="accounting/rates" element={<AccountingRatesPage />} />
            </Route>

            <Route path="master/customers" element={<MasterCustomersPage />} />
            <Route path="master/drivers" element={<MasterDriversPage />} />
            <Route path="master/trucks" element={<MasterTrucksPage />} />
            <Route path="master/chassis" element={<MasterChassisPage />} />
            <Route path="master/equipment-pools" element={<MasterEquipmentPoolsPage />} />
            <Route path="master/terminals" element={<MasterTerminalsPage />} />
            <Route path="master/vessels" element={<MasterVesselsPage />} />
            <Route path="master/locations" element={<MasterLocationsPage />} />
            <Route element={<ProtectedRoute require="ADMIN" />}>
              <Route path="master/charge-codes" element={<MasterChargeCodesPage />} />
              <Route path="master/rate-cards" element={<MasterRateCardsPage />} />
              <Route path="master/rate-tariffs" element={<MasterRateTariffsPage />} />
              <Route path="master/rate-quotes" element={<MasterRateQuotesPage />} />
              <Route path="master/distance-matrix" element={<MasterDistanceMatrixPage />} />
            </Route>

            <Route element={<ProtectedRoute require="SUPER_ADMIN" />}>
              <Route path="system/teams" element={<SystemTeamsPage />} />
              <Route path="system/users" element={<SystemUsersPage />} />
            </Route>

            <Route element={<ProtectedRoute require="ADMIN" />}>
              <Route path="settings/team" element={<SettingsTeamPage />} />
              <Route
                path="settings/members"
                element={<SettingsMembersPage />}
              />
              <Route path="settings/api-keys" element={<ApiKeysPage />} />
            </Route>
            <Route path="settings/theme" element={<SettingsThemePage />} />
            <Route
              path="settings/notifications"
              element={<SettingsNotificationsPage />}
            />
            <Route
              path="settings/privacy"
              element={<SettingsPrivacyPage />}
            />
            <Route path="settings/tags" element={<SettingsTagsPage />} />
            <Route path="settings/plugins" element={<SettingsPluginsPage />} />
            <Route path="settings/payment" element={<SettingsPaymentPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
