// Single source of truth for the left sidebar, the header breadcrumb, and
// the favourites store. Declared as plain data (no React) so it can also be
// imported from non-component code (breadcrumb lookups, analytics event
// tagging, etc.) without pulling in the sidebar render cost.
//
// Each leaf's `path` is *relative* to the tenant-scoped root `/app/:tenantId` —
// the shell (TenantScopedLayout) prepends the tenant segment when rendering
// actual links. This keeps the nav tree tenant-agnostic.

// Icon names are stringly-typed so the config is serialisable (favourites
// persist via localStorage). The Sidebar maps these back to lucide-react
// components at render time.
export type NavIconName =
  | "LayoutDashboard"
  | "LayoutGrid"
  | "Folder"
  | "Home"
  | "Ship"
  | "Package"
  | "Container"
  | "Anchor"
  | "Calendar"
  | "Warehouse"
  | "CalendarClock"
  | "Plane"
  | "TrainTrack"
  | "Plus"
  | "BarChart3"
  | "Key"
  | "LineChart"
  | "BookOpen"
  | "Webhook"
  | "User"
  | "UsersRound"
  | "Settings"
  | "Bell"
  | "Tag"
  | "CreditCard"
  | "Palette"
  | "Sunrise"
  | "Hand"
  | "Plug";

export type NavLeaf = {
  type: "leaf";
  label: string;
  iconName: NavIconName;
  path: string;
  comingSoon?: boolean;
  // When true, the sidebar renders a "new tab" affordance and skips React
  // Router navigation. Useful for external docs (e.g. Swagger UI).
  external?: boolean;
  // When true, the leaf is omitted from sidebar rendering but still
  // resolves for breadcrumb + favourites lookups. Used for pages reachable
  // only via other UI affordances.
  hidden?: boolean;
};

export type NavSection = {
  type: "section";
  label: string;
  iconName: NavIconName;
  children: NavLeaf[];
};

export type NavNode = NavLeaf | NavSection;

// Order below is the order rendered in the sidebar. Adjust here, not in
// Sidebar.tsx. One-depth entry points (Dashboard / Reports) sit above the
// two-depth transport-domain sections. Track is intentionally nested *inside*
// each domain because the input format (MBL vs AWB vs Waybill) and the
// downstream Shipments list are domain-specific — a single top-level Track
// page would require conditional fields and doesn't share pagination state
// with the Shipments list anyway.
// `label` values are i18next keys (resolved against `nav.*` in the bundles).
// Rendering code calls `t(label)` so the sidebar / breadcrumb / favourites
// all stay in sync with the active locale. Keep these keys stable — they
// persist via the favourites store and are referenced from breadcrumb paths.
export const NAV_CONFIG: readonly NavNode[] = [
  // ── Overview (tenant-wide dashboards & reports) ─────────────
  // Dashboard / Reports 를 한 섹션으로 묶어 나머지 도메인 섹션들과 depth 를
  // 통일한다 (모든 최상위가 "펼치기 가능한 section"). 이 구조가 Terminal49 /
  // Project44 계열 SaaS 의 IA 와도 일관.
  // 섹션 아이콘은 Home (집 모양) 으로 — 하위 Dashboard (LayoutDashboard, 위젯
  // 그리드) 와 확실히 구분되는 모양. Overview = "시작 지점 / 홈" 의미.
  {
    type: "section",
    label: "nav.overview",
    iconName: "Home",
    children: [
      {
        type: "leaf",
        label: "nav.dashboard",
        iconName: "LayoutDashboard",
        path: "",
      },
      {
        type: "leaf",
        label: "nav.projects",
        iconName: "Folder",
        path: "/projects",
      },
      {
        type: "leaf",
        label: "nav.reports",
        iconName: "BarChart3",
        path: "/reports",
      },
    ],
  },

  // ── Ocean (fully implemented domain) ──────────────────────
  {
    type: "section",
    label: "nav.ocean",
    iconName: "Ship",
    children: [
      {
        type: "leaf",
        label: "nav.track",
        iconName: "Plus",
        path: "/ocean/track",
      },
      {
        type: "leaf",
        label: "nav.shipments",
        iconName: "Package",
        path: "/ocean/shipments",
      },
      {
        type: "leaf",
        label: "nav.containers",
        iconName: "Container",
        path: "/ocean/containers",
      },
      {
        type: "leaf",
        label: "nav.vessels",
        iconName: "Anchor",
        path: "/ocean/vessels",
        comingSoon: true,
      },
      {
        type: "leaf",
        label: "nav.schedules",
        iconName: "Calendar",
        path: "/ocean/schedules",
        comingSoon: true,
      },
    ],
  },

  // ── Terminal (scaffold — sub-pages shown as Coming Soon) ──
  {
    type: "section",
    label: "nav.terminal",
    iconName: "Warehouse",
    children: [
      {
        type: "leaf",
        label: "nav.containers",
        iconName: "Container",
        path: "/terminal/containers",
        comingSoon: true,
      },
      {
        type: "leaf",
        label: "nav.appointments",
        iconName: "CalendarClock",
        path: "/terminal/appointments",
        comingSoon: true,
      },
    ],
  },

  // ── Air (scaffold) ───────────────────────────────────────
  {
    type: "section",
    label: "nav.air",
    iconName: "Plane",
    children: [
      {
        type: "leaf",
        label: "nav.track",
        iconName: "Plus",
        path: "/air/track",
        comingSoon: true,
      },
      {
        type: "leaf",
        label: "nav.shipments",
        iconName: "Package",
        path: "/air/shipments",
        comingSoon: true,
      },
      {
        type: "leaf",
        label: "nav.schedules",
        iconName: "Calendar",
        path: "/air/schedules",
        comingSoon: true,
      },
    ],
  },

  // ── Rail (scaffold) ──────────────────────────────────────
  {
    type: "section",
    label: "nav.rail",
    iconName: "TrainTrack",
    children: [
      {
        type: "leaf",
        label: "nav.track",
        iconName: "Plus",
        path: "/rail/track",
        comingSoon: true,
      },
      {
        type: "leaf",
        label: "nav.shipments",
        iconName: "Package",
        path: "/rail/shipments",
        comingSoon: true,
      },
    ],
  },

  // ── Developer ────────────────────────────────────────────
  {
    type: "section",
    label: "nav.developer",
    iconName: "Key",
    children: [
      {
        type: "leaf",
        label: "nav.apiKeys",
        iconName: "Key",
        path: "/developer/api-keys",
      },
      {
        type: "leaf",
        label: "nav.usage",
        iconName: "LineChart",
        path: "/developer/usage",
      },
      {
        type: "leaf",
        label: "nav.documentation",
        iconName: "BookOpen",
        path: "/developer/docs",
        external: true,
      },
      {
        type: "leaf",
        label: "nav.webhooks",
        iconName: "Webhook",
        path: "/developer/webhooks",
        comingSoon: true,
      },
    ],
  },

  // ── Settings ─────────────────────────────────────────────
  // Profile is *not* in this section — it opens as a modal from the user
  // avatar above the tenant switcher.
  {
    type: "section",
    label: "nav.settings",
    iconName: "Settings",
    children: [
      {
        type: "leaf",
        label: "nav.tenant",
        iconName: "UsersRound",
        path: "/settings/tenant",
      },
      {
        type: "leaf",
        label: "nav.members",
        iconName: "UsersRound",
        path: "/settings/members",
      },
      {
        type: "leaf",
        label: "nav.theme",
        iconName: "Palette",
        path: "/settings/theme",
      },
      {
        type: "leaf",
        label: "nav.notifications",
        iconName: "Bell",
        path: "/settings/notifications",
      },
      {
        type: "leaf",
        label: "nav.privacy",
        iconName: "Hand",
        path: "/settings/privacy",
      },
      {
        type: "leaf",
        label: "nav.tags",
        iconName: "Tag",
        path: "/settings/tags",
      },
      {
        type: "leaf",
        label: "nav.payment",
        iconName: "CreditCard",
        path: "/settings/payment",
      },
      {
        type: "leaf",
        label: "nav.plugins",
        iconName: "Plug",
        path: "/settings/plugins",
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────

/** Strip the `/app/<tenantId>` prefix so paths in NAV_CONFIG can match directly. */
function stripTenantPrefix(pathname: string): string {
  const m = pathname.match(/^\/app\/\d+(.*)$/);
  return m ? m[1] : "";
}

/**
 * Find the nav leaf (and its parent section, if any) that matches the given
 * full pathname. Handles detail pages by prefix: e.g. `/ocean/shipments/42`
 * resolves to the `Shipments` leaf. `hidden` leaves still match — the flag
 * only affects sidebar rendering.
 */
export function resolveNavMatch(
  pathname: string,
): { leaf: NavLeaf; section?: NavSection } | null {
  const sub = stripTenantPrefix(pathname);

  for (const node of NAV_CONFIG) {
    if (node.type === "leaf") {
      if (matchesLeaf(sub, node.path)) return { leaf: node };
    } else {
      for (const child of node.children) {
        if (matchesLeaf(sub, child.path)) {
          return { leaf: child, section: node };
        }
      }
    }
  }
  return null;
}

function matchesLeaf(sub: string, leafPath: string): boolean {
  // Root dashboard — exact match on empty path.
  if (leafPath === "") return sub === "";
  // Exact match OR detail page (leaf path + trailing segment).
  return sub === leafPath || sub.startsWith(leafPath + "/");
}

/** Favourite metadata for the current page — title + icon name.
 *  Returns null for routes that aren't in the nav config (dynamic segments
 *  still resolve via parent leaf, but un-mapped routes return null so the
 *  Header star can be disabled). */
export function resolveFavoriteMeta(
  pathname: string,
): { title: string; iconName: NavIconName } | null {
  const match = resolveNavMatch(pathname);
  if (!match) return null;
  return { title: match.leaf.label, iconName: match.leaf.iconName };
}
