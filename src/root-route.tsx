import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// Layout shells stay eager — they hold the <Suspense> boundary and render
// before any child page needs to resolve. Lazily importing a layout would
// flash the fallback every time a guard short-circuits, which is the
// opposite of what we want.
import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import MemberOnlyLayout from "@/components/layout/member-only-layout";
import TenantScopedLayout from "@/components/layout/tenant-scoped-layout";
import GlobalLoader from "@/components/global-loader";

// Every page below is split into its own chunk by Vite (one `import()`
// call = one async chunk). The first page the user hits is the only JS
// bundle that has to download on cold load — all other pages arrive on
// demand as they navigate, and React Query / assets get cached at the
// CDN (Amplify / CloudFront) edge.

// Auth / onboarding
const SignInPage = lazy(() => import("@/pages/sign-in-page"));
const SignUpPage = lazy(() => import("@/pages/sign-up-page"));
const ForgetPasswordPage = lazy(() => import("@/pages/forget-password-page"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password-page"));
const OAuthCallbackPage = lazy(() => import("@/pages/oauth-callback-page"));
const TwoStepVerificationPage = lazy(
  () => import("@/pages/two-step-verification-page"),
);
const ChooseAccountTypePage = lazy(
  () => import("@/pages/choose-account-type-page"),
);
const AccountInfoPage = lazy(() => import("@/pages/account-info-page"));
const BillingDetailsPage = lazy(() => import("@/pages/billing-details-page"));
const BillingCardPage = lazy(() => import("@/pages/billing-card-page"));

// App hub
const AppHomePage = lazy(() => import("@/pages/app-home-page"));

// STE — real pages
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const LiveMapPage = lazy(() => import("@/pages/live-map-page"));
const AlertsPage = lazy(() => import("@/pages/alerts-page"));
const DashboardSettingsPage = lazy(
  () => import("@/pages/dashboard-settings-page"),
);
const OceanShipmentsPage = lazy(() => import("@/pages/ocean-shipments-page"));
const OceanShipmentDetailPage = lazy(
  () => import("@/pages/ocean-shipment-detail-page"),
);
const OceanTrackPage = lazy(() => import("@/pages/ocean-track-page"));
const DeveloperApiKeysPage = lazy(
  () => import("@/pages/developer-api-keys-page"),
);
const DeveloperUsagePage = lazy(() => import("@/pages/developer-usage-page"));
const SettingsTenantPage = lazy(() => import("@/pages/settings-tenant-page"));
const SettingsMembersPage = lazy(() => import("@/pages/settings-members-page"));
const SettingsNotificationsPage = lazy(
  () => import("@/pages/settings-notifications-page"),
);

// STE — Coming Soon placeholders
const OceanContainersPage = lazy(() => import("@/pages/ocean-containers-page"));
const OceanVesselsComingSoonPage = lazy(
  () => import("@/pages/ocean-vessels-coming-soon-page"),
);
const OceanSchedulesComingSoonPage = lazy(
  () => import("@/pages/ocean-schedules-coming-soon-page"),
);
const TerminalContainersComingSoonPage = lazy(
  () => import("@/pages/terminal-containers-coming-soon-page"),
);
const TerminalAppointmentsComingSoonPage = lazy(
  () => import("@/pages/terminal-appointments-coming-soon-page"),
);
const AirShipmentsComingSoonPage = lazy(
  () => import("@/pages/air-shipments-coming-soon-page"),
);
const AirSchedulesComingSoonPage = lazy(
  () => import("@/pages/air-schedules-coming-soon-page"),
);
const AirTrackComingSoonPage = lazy(
  () => import("@/pages/air-track-coming-soon-page"),
);
const RailShipmentsComingSoonPage = lazy(
  () => import("@/pages/rail-shipments-coming-soon-page"),
);
const RailTrackComingSoonPage = lazy(
  () => import("@/pages/rail-track-coming-soon-page"),
);
const ProjectsPage = lazy(() => import("@/pages/projects-page"));
const ReportsPage = lazy(() => import("@/pages/reports-page"));
const DeveloperWebhooksComingSoonPage = lazy(
  () => import("@/pages/developer-webhooks-coming-soon-page"),
);
const SettingsThemePage = lazy(() => import("@/pages/settings-theme-page"));
const SettingsPrivacyPage = lazy(() => import("@/pages/settings-privacy-page"));
const SettingsPluginsPage = lazy(() => import("@/pages/settings-plugins-page"));
const SettingsTagsPage = lazy(() => import("@/pages/settings-tags-page"));
const SettingsPaymentPage = lazy(() => import("@/pages/settings-payment-page"));

// Error / status
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));
const ComingSoonPage = lazy(() => import("@/pages/coming-soon-page"));
const MaintenancePage = lazy(() => import("@/pages/maintenance-page"));
const MobileComingSoonPage = lazy(
  () => import("@/pages/mobile-coming-soon-page"),
);

// Marketing (landing).
// The marketing bundle is heavy (cobe WebGL globe, framer-motion, long
// prose copy) and almost never visited by authenticated users, so keeping
// it in a separate chunk is especially important.
const LandingLayout = lazy(() => import("@/pages/landing/landing-layout"));
const LandingPage = lazy(() => import("@/pages/landing/landing-page"));
const CareersPage = lazy(() => import("@/pages/landing/careers-page"));
const PricingPage = lazy(() => import("@/pages/landing/pricing-page"));
const AboutPage = lazy(() => import("@/pages/landing/about-page"));
const BlogPage = lazy(() => import("@/pages/landing/blog-page"));
const CustomersPage = lazy(() => import("@/pages/landing/customers-page"));

export default function RootRoute() {
  // Single <Suspense> boundary at the top so every lazy page shares one
  // fallback. GlobalLoader matches the bootstrap loader that SessionProvider
  // shows, so the transition between "app starting" and "first page
  // resolving" is visually continuous.
  return (
    <Suspense fallback={<GlobalLoader />}>
      <Routes>
        {/* Public — OAuth popup landing + status pages. */}
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/mobile-coming-soon" element={<MobileComingSoonPage />} />

        {/* Marketing (public). Index = landing. */}
        <Route element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Route>

        {/* Guest only — auth & onboarding flows. */}
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

        {/* Member only — the app. Everything nested under `/app`. */}
        <Route path="/app" element={<MemberOnlyLayout />}>
          <Route index element={<AppHomePage />} />

          <Route path=":tenantId" element={<TenantScopedLayout />}>
            <Route index element={<DashboardPage />} />

            <Route path="live-map" element={<LiveMapPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route
              path="dashboard-settings"
              element={<DashboardSettingsPage />}
            />

            <Route path="ocean/track" element={<OceanTrackPage />} />
            <Route path="ocean/shipments" element={<OceanShipmentsPage />} />
            <Route
              path="ocean/shipments/:shipmentId"
              element={<OceanShipmentDetailPage />}
            />
            <Route
              path="ocean/containers"
              element={<OceanContainersPage />}
            />
            <Route
              path="ocean/vessels"
              element={<OceanVesselsComingSoonPage />}
            />
            <Route
              path="ocean/schedules"
              element={<OceanSchedulesComingSoonPage />}
            />

            <Route
              path="terminal/containers"
              element={<TerminalContainersComingSoonPage />}
            />
            <Route
              path="terminal/appointments"
              element={<TerminalAppointmentsComingSoonPage />}
            />

            <Route path="air/track" element={<AirTrackComingSoonPage />} />
            <Route
              path="air/shipments"
              element={<AirShipmentsComingSoonPage />}
            />
            <Route
              path="air/schedules"
              element={<AirSchedulesComingSoonPage />}
            />

            <Route path="rail/track" element={<RailTrackComingSoonPage />} />
            <Route
              path="rail/shipments"
              element={<RailShipmentsComingSoonPage />}
            />

            <Route path="projects" element={<ProjectsPage />} />
            <Route path="reports" element={<ReportsPage />} />

            <Route
              path="developer/api-keys"
              element={<DeveloperApiKeysPage />}
            />
            <Route path="developer/usage" element={<DeveloperUsagePage />} />
            <Route
              path="developer/webhooks"
              element={<DeveloperWebhooksComingSoonPage />}
            />

            <Route path="settings/tenant" element={<SettingsTenantPage />} />
            <Route
              path="settings/members"
              element={<SettingsMembersPage />}
            />
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
            <Route path="settings/payment" element={<SettingsPaymentPage />} />
            <Route
              path="settings/plugins"
              element={<SettingsPluginsPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
