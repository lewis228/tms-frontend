// 사이드바 + breadcrumb + favorites 의 단일 진실.
// 데이터로 표현 — 컴포넌트 안에 if (role >= ADMIN) 산재 금지.
//
// `path` 는 `/app/:tenantId` 하위의 **상대 경로** ("dashboard", "delivery-orders" 등).
// 사이드바가 현재 URL 의 :tenantId 를 prefix 로 붙여 최종 URL 을 만든다.
// favorite store 도 같은 상대 경로를 키로 사용 → tenant 전환 시 즐겨찾기가 따라옴.
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
  | "BadgeDollarSign";

export type NavLeaf = {
  type: "leaf";
  label: string; // 한국어 라벨 (i18n 도입 시 키로 전환).
  iconName: NavIconName;
  path: string;
  requiredRole?: UserRole;
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
    label: "Dashboard",
    iconName: "LayoutDashboard",
    path: "dashboard",
  },
  {
    type: "section",
    label: "Operations",
    iconName: "Truck",
    requiredRole: "DISPATCHER",
    children: [
      {
        type: "leaf",
        label: "Dispatch",
        iconName: "Truck",
        path: "dispatch",
        requiredRole: "DISPATCHER",
      },
      {
        type: "leaf",
        label: "Driver Schedule",
        iconName: "Map",
        path: "dispatch/drivers",
        requiredRole: "DISPATCHER",
      },
      {
        type: "leaf",
        label: "Delivery Orders",
        iconName: "Container",
        path: "delivery-orders",
        requiredRole: "DISPATCHER",
      },
    ],
  },
  {
    type: "section",
    label: "Accounting",
    iconName: "Wallet",
    requiredRole: "DISPATCHER",
    children: [
      {
        type: "leaf",
        label: "Settlements",
        iconName: "Receipt",
        path: "accounting",
        requiredRole: "DISPATCHER",
      },
      {
        type: "leaf",
        label: "Rate Settings",
        iconName: "BadgeDollarSign",
        path: "accounting/rates",
        requiredRole: "ADMIN",
      },
    ],
  },
  {
    type: "section",
    label: "Master Data",
    iconName: "Folder",
    children: [
      {
        type: "leaf",
        label: "Customers",
        iconName: "Building2",
        path: "master/customers",
      },
      {
        type: "leaf",
        label: "Drivers",
        iconName: "User",
        path: "master/drivers",
      },
      {
        type: "leaf",
        label: "Terminals",
        iconName: "Anchor",
        path: "master/terminals",
      },
      {
        type: "leaf",
        label: "Vessels",
        iconName: "Ship",
        path: "master/vessels",
      },
      {
        type: "leaf",
        label: "Locations",
        iconName: "MapPin",
        path: "master/locations",
      },
    ],
  },
  {
    type: "section",
    label: "System",
    iconName: "Server",
    requiredRole: "SUPER_ADMIN",
    children: [
      {
        type: "leaf",
        label: "Tenants",
        iconName: "Building2",
        path: "system/tenants",
        requiredRole: "SUPER_ADMIN",
      },
      {
        type: "leaf",
        label: "System Users",
        iconName: "Users",
        path: "system/users",
        requiredRole: "SUPER_ADMIN",
      },
    ],
  },
  {
    type: "section",
    label: "Settings",
    iconName: "Settings",
    children: [
      {
        type: "leaf",
        label: "Tenant",
        iconName: "Building2",
        path: "settings/tenant",
        requiredRole: "ADMIN",
      },
      {
        type: "leaf",
        label: "Members",
        iconName: "Users",
        path: "settings/members",
        requiredRole: "ADMIN",
      },
      {
        type: "leaf",
        label: "Theme",
        iconName: "Palette",
        path: "settings/theme",
      },
      {
        type: "leaf",
        label: "Notifications",
        iconName: "Bell",
        path: "settings/notifications",
      },
      {
        type: "leaf",
        label: "Privacy",
        iconName: "ShieldCheck",
        path: "settings/privacy",
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

/** /app/:tenantId/foo/bar → "foo/bar" (또는 매치 안 되면 null). */
export function relativizeAppPath(pathname: string): string | null {
  const m = pathname.match(/^\/app\/\d+\/(.*)$/);
  return m ? m[1] : null;
}

export function resolveFavoriteMeta(
  path: string,
): { label: string; iconName: NavIconName } | null {
  const m = resolveNavMatch(path);
  if (!m) return null;
  return { label: m.leaf.label, iconName: m.leaf.iconName };
}
