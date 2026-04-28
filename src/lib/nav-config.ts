// 사이드바 + breadcrumb + favorites 의 단일 진실.
// 데이터로 표현 — 컴포넌트 안에 if (role >= ADMIN) 산재 금지.
//
// `path` 는 `/app/:teamId` 하위의 **상대 경로** ("dashboard", "delivery-orders" 등).
// 사이드바가 현재 URL 의 :teamId 를 prefix 로 붙여 최종 URL 을 만든다.
// favorite store 도 같은 상대 경로를 키로 사용 → team 전환 시 즐겨찾기가 따라옴.
//
// `requiredRole` 이 명시되면 ProtectedRoute / Sidebar 에서 ROLE_RANK 비교로 게이트.
import type { UserRole } from "@/types";
import { ROLE_RANK } from "@/types";

export type NavIconName =
  | "LayoutDashboard"
  | "Truck"
  | "Wallet"
  | "Folder"
  | "Settings"
  | "Server"
  | "Users"
  | "User"
  | "Building2"
  | "Map"
  | "Anchor"
  | "Container"
  | "Ship"
  | "MapPin"
  | "Bell"
  | "ShieldCheck"
  | "Palette"
  | "Receipt"
  | "BadgeDollarSign"
  | "Tag"
  | "Plug"
  | "CreditCard"
  | "Key";

export type NavLeaf = {
  type: "leaf";
  label: string;
  iconName: NavIconName;
  path: string;
  requiredRole?: UserRole;
  /** Hidden from the sidebar but still used for breadcrumb / favorites. */
  hidden?: boolean;
};

export type NavSection = {
  type: "section";
  label: string;
  iconName: NavIconName;
  requiredRole?: UserRole;
  children: NavLeaf[];
};

export type NavNode = NavLeaf | NavSection;

export const NAV_CONFIG: NavNode[] = [
  {
    type: "leaf",
    label: "nav.dashboard",
    iconName: "LayoutDashboard",
    path: "dashboard",
  },
  {
    type: "section",
    label: "nav.operations",
    iconName: "Truck",
    requiredRole: "DISPATCHER",
    children: [
      {
        type: "leaf",
        label: "nav.dispatch",
        iconName: "Truck",
        path: "dispatch",
        requiredRole: "DISPATCHER",
      },
      {
        type: "leaf",
        label: "nav.driverSchedule",
        iconName: "Map",
        path: "dispatch/drivers",
        requiredRole: "DISPATCHER",
      },
      {
        type: "leaf",
        label: "nav.deliveryOrders",
        iconName: "Container",
        path: "delivery-orders",
        requiredRole: "DISPATCHER",
      },
      {
        type: "leaf",
        label: "nav.streetTurns",
        iconName: "Anchor",
        path: "street-turns",
        requiredRole: "DISPATCHER",
      },
    ],
  },
  {
    type: "section",
    label: "nav.accounting",
    iconName: "Wallet",
    requiredRole: "DISPATCHER",
    children: [
      {
        type: "leaf",
        label: "nav.settlements",
        iconName: "Receipt",
        path: "accounting",
        requiredRole: "DISPATCHER",
      },
      {
        type: "leaf",
        label: "nav.rateSettings",
        iconName: "BadgeDollarSign",
        path: "accounting/rates",
        requiredRole: "ADMIN",
      },
    ],
  },
  {
    type: "section",
    label: "nav.masterData",
    iconName: "Folder",
    children: [
      {
        type: "leaf",
        label: "nav.customers",
        iconName: "Building2",
        path: "master/customers",
      },
      {
        type: "leaf",
        label: "nav.drivers",
        iconName: "User",
        path: "master/drivers",
      },
      {
        type: "leaf",
        label: "nav.trucks",
        iconName: "Truck",
        path: "master/trucks",
      },
      {
        type: "leaf",
        label: "nav.chassis",
        iconName: "Container",
        path: "master/chassis",
      },
      {
        type: "leaf",
        label: "nav.equipmentPools",
        iconName: "Folder",
        path: "master/equipment-pools",
      },
      {
        type: "leaf",
        label: "nav.terminals",
        iconName: "Anchor",
        path: "master/terminals",
      },
      {
        type: "leaf",
        label: "nav.vessels",
        iconName: "Ship",
        path: "master/vessels",
      },
      {
        type: "leaf",
        label: "nav.locations",
        iconName: "MapPin",
        path: "master/locations",
      },
      {
        type: "leaf",
        label: "nav.chargeCodes",
        iconName: "Tag",
        path: "master/charge-codes",
        requiredRole: "ADMIN",
      },
      {
        type: "leaf",
        label: "nav.rateCards",
        iconName: "BadgeDollarSign",
        path: "master/rate-cards",
        requiredRole: "ADMIN",
      },
    ],
  },
  {
    type: "section",
    label: "nav.system",
    iconName: "Server",
    requiredRole: "SUPER_ADMIN",
    children: [
      {
        type: "leaf",
        label: "nav.teams",
        iconName: "Building2",
        path: "system/teams",
        requiredRole: "SUPER_ADMIN",
      },
      {
        type: "leaf",
        label: "nav.systemUsers",
        iconName: "Users",
        path: "system/users",
        requiredRole: "SUPER_ADMIN",
      },
    ],
  },
  {
    type: "section",
    label: "nav.settings",
    iconName: "Settings",
    children: [
      {
        type: "leaf",
        label: "nav.settingsTeam",
        iconName: "Building2",
        path: "settings/team",
        requiredRole: "ADMIN",
      },
      {
        type: "leaf",
        label: "nav.settingsMembers",
        iconName: "Users",
        path: "settings/members",
        requiredRole: "ADMIN",
      },
      {
        type: "leaf",
        label: "nav.settingsApiKeys",
        iconName: "Key",
        path: "settings/api-keys",
        requiredRole: "ADMIN",
      },
      {
        type: "leaf",
        label: "nav.settingsTheme",
        iconName: "Palette",
        path: "settings/theme",
      },
      {
        type: "leaf",
        label: "nav.settingsNotifications",
        iconName: "Bell",
        path: "settings/notifications",
      },
      {
        type: "leaf",
        label: "nav.settingsPrivacy",
        iconName: "ShieldCheck",
        path: "settings/privacy",
      },
      {
        type: "leaf",
        label: "nav.settingsTags",
        iconName: "Tag",
        path: "settings/tags",
      },
      {
        type: "leaf",
        label: "nav.settingsPlugins",
        iconName: "Plug",
        path: "settings/plugins",
      },
      {
        type: "leaf",
        label: "nav.settingsPayment",
        iconName: "CreditCard",
        path: "settings/payment",
      },
    ],
  },
];

export function hasAccess(role: UserRole | null, required?: UserRole): boolean {
  if (!required) return true;
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[required];
}

export function visibleNavFor(role: UserRole | null): NavNode[] {
  const out: NavNode[] = [];
  for (const node of NAV_CONFIG) {
    if (node.type === "leaf") {
      if (hasAccess(role, node.requiredRole)) out.push(node);
      continue;
    }
    if (!hasAccess(role, node.requiredRole)) continue;
    const children = node.children.filter((c) =>
      hasAccess(role, c.requiredRole),
    );
    if (children.length === 0) continue;
    out.push({ ...node, children });
  }
  return out;
}

export type NavMatch = {
  section?: NavSection;
  leaf: NavLeaf;
};

export function resolveNavMatch(relativePath: string): NavMatch | null {
  for (const node of NAV_CONFIG) {
    if (node.type === "leaf") {
      if (matches(relativePath, node.path)) return { leaf: node };
    } else {
      for (const child of node.children) {
        if (matches(relativePath, child.path)) return { section: node, leaf: child };
      }
    }
  }
  return null;
}

function matches(pathname: string, target: string): boolean {
  if (pathname === target) return true;
  return pathname.startsWith(target + "/");
}

/** /app/:teamId/foo/bar → "foo/bar" (또는 매치 안 되면 null). */
export function relativizeAppPath(pathname: string): string | null {
  const m = pathname.match(/^\/app\/\d+\/?(.*)$/);
  return m ? m[1] : null;
}

export function resolveFavoriteMeta(
  path: string,
): { label: string; iconName: NavIconName } | null {
  const m = resolveNavMatch(path);
  if (!m) return null;
  return { label: m.leaf.label, iconName: m.leaf.iconName };
}
