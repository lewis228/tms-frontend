import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Anchor,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarClock,
  ChevronDown,
  Container,
  CreditCard,
  ExternalLink,
  Folder,
  Hand,
  Home,
  Key,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  LogOut,
  Package,
  Palette,
  Plane,
  Plug,
  Plus,
  Settings,
  Ship,
  Sparkles,
  Star,
  Sunrise,
  Tag,
  TrainTrack,
  User,
  UsersRound,
  Warehouse,
  Webhook,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TenantSwitcher from "@/components/layout/tenant-switcher";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useIsSidebarCollapsed } from "@/store/sidebar";
import { useFavorites, useRemoveFavorite } from "@/store/favorites";
import { useSession } from "@/store/session";
import { useOpenProfileModal } from "@/store/profile-modal";
import type { AppUser } from "@/types";
import {
  NAV_CONFIG,
  resolveNavMatch,
  type NavIconName,
  type NavLeaf,
  type NavNode,
  type NavSection,
} from "@/lib/nav-config";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";

// Icon lookup — keep in sync with NavIconName union. Having this as a local
// map lets nav-config.ts stay serialisable (needed for the favourites store).
const ICON_MAP: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  LayoutGrid,
  Folder,
  Home,
  Ship,
  Package,
  Container,
  Anchor,
  Calendar,
  Warehouse,
  CalendarClock,
  Plane,
  TrainTrack,
  Plus,
  BarChart3,
  Key,
  LineChart,
  BookOpen,
  Webhook,
  User,
  UsersRound,
  Settings,
  Bell,
  Tag,
  CreditCard,
  Palette,
  Sunrise,
  Hand,
  Plug,
};

const IS_MOCK_MODE = import.meta.env.VITE_MOCK_SESSION === "true";

// Build an absolute `/app/:tenantId/...` URL from a nav leaf's relative path.
// Falls back to `/app` when the component is rendered outside a tenant scope
// (shouldn't happen — it's only mounted by TenantScopedLayout — but defend).
function absolutePath(relativePath: string, tenantId: string | undefined): string {
  if (!tenantId) return "/app";
  if (relativePath === "") return `/app/${tenantId}`;
  return `/app/${tenantId}${relativePath}`;
}

export default function Sidebar() {
  const location = useLocation();
  const params = useParams();
  const isCollapsed = useIsSidebarCollapsed();
  const openAlertModal = useOpenAlertModal();
  const { t } = useTranslation();
  const tenantId = params.tenantId;

  const { mutate: signOut, isPending: isSignOutPending } = useSignOut({
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const handleSignOutClick = () => {
    openAlertModal({
      title: t("profile.signOutConfirmTitle"),
      description: t("profile.signOutConfirmDescription"),
      onPositive: () => signOut(),
    });
  };

  // Resolve the current page's nav position so sections auto-expand to reveal
  // the active leaf. Computed once per location change.
  const activeMatch = useMemo(
    () => resolveNavMatch(location.pathname),
    [location.pathname],
  );

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col overflow-y-auto border-r border-black/10 bg-white transition-all duration-300",
          isCollapsed ? "w-[60px] px-1.5" : "w-[232px] px-3",
        )}
      >
        <div className="pb-2 pt-4">
          <UserProfileHeader isCollapsed={isCollapsed} />
        </div>

        <div className="pb-3">
          <TenantSwitcher isCollapsed={isCollapsed} />
        </div>

        <FavoritesSection
          isCollapsed={isCollapsed}
          tenantId={tenantId}
          pathname={location.pathname}
        />

        <nav className="flex flex-col gap-0.5 pb-3">
          {NAV_CONFIG.map((node) => (
            <NavNodeRow
              key={nodeKey(node)}
              node={node}
              tenantId={tenantId}
              isCollapsed={isCollapsed}
              currentPath={location.pathname}
              activeLeafPath={activeMatch?.leaf.path}
              activeSectionLabel={activeMatch?.section?.label ?? null}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pb-4">
          {IS_MOCK_MODE ? (
            isCollapsed ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-black/10 p-1.5">
                <span className="text-[9px] font-bold text-black/55">
                  {t("sidebar.demoShort")}
                </span>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-black/10 px-3 py-2 text-xs text-black/55">
                <div className="font-medium text-black">
                  {t("sidebar.demoMode")}
                </div>
                <div className="text-[11px] leading-4 text-black/55">
                  {t("sidebar.authDisabled")}
                </div>
              </div>
            )
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={isSignOutPending}
                  onClick={handleSignOutClick}
                  className={cn(
                    "flex items-center rounded-xl py-1.5 text-sm text-black/55 transition-colors hover:text-black disabled:opacity-50",
                    isCollapsed ? "justify-center px-2" : "gap-2 px-3",
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>{t("common.signOut")}</span>}
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  {t("common.signOut")}
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function nodeKey(node: NavNode): string {
  return node.type === "section"
    ? `section:${node.label}`
    : `leaf:${node.path}`;
}

function NavNodeRow({
  node,
  tenantId,
  isCollapsed,
  currentPath,
  activeLeafPath,
  activeSectionLabel,
}: {
  node: NavNode;
  tenantId: string | undefined;
  isCollapsed: boolean;
  currentPath: string;
  activeLeafPath: string | undefined;
  activeSectionLabel: string | null;
}) {
  if (node.type === "leaf") {
    // `hidden: true` routes still exist but don't take a sidebar slot —
    // Profile is reached via the UserProfileHeader instead.
    if (node.hidden) return null;
    return (
      <LeafRow
        leaf={node}
        tenantId={tenantId}
        isCollapsed={isCollapsed}
        currentPath={currentPath}
        activeLeafPath={activeLeafPath}
      />
    );
  }
  return (
    <SectionRow
      section={node}
      tenantId={tenantId}
      isCollapsed={isCollapsed}
      currentPath={currentPath}
      activeLeafPath={activeLeafPath}
      defaultExpanded={activeSectionLabel === node.label}
    />
  );
}

function SectionRow({
  section,
  tenantId,
  isCollapsed,
  currentPath,
  activeLeafPath,
  defaultExpanded,
}: {
  section: NavSection;
  tenantId: string | undefined;
  isCollapsed: boolean;
  currentPath: string;
  activeLeafPath: string | undefined;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { t } = useTranslation();
  const Icon = ICON_MAP[section.iconName];

  // Skip leaves flagged `hidden: true` — they stay in nav-config for
  // breadcrumb/favourites resolution but shouldn't clutter the sidebar.
  const visibleChildren = section.children.filter((c) => !c.hidden);
  // All-hidden sections (rare) drop out entirely so we don't render an
  // empty "Ocean" header with nothing beneath it.
  if (visibleChildren.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-0.5 pt-1">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center py-1.5 text-black/50">
              <Icon className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {t(section.label)}
          </TooltipContent>
        </Tooltip>
        {visibleChildren.map((child) => (
          <LeafRow
            key={child.path}
            leaf={child}
            tenantId={tenantId}
            isCollapsed
            currentPath={currentPath}
            activeLeafPath={activeLeafPath}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 pt-1">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-black/85 transition-colors hover:bg-black/[0.04] hover:text-black"
      >
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 text-black/50 transition-transform",
            !expanded && "-rotate-90",
          )}
        />
        <Icon className="h-4 w-4 text-black/70" />
        <span className="flex-1 text-left text-[15px] font-medium">
          {t(section.label)}
        </span>
      </button>
      {expanded && (
        <div className="ml-2 flex flex-col gap-0.5 border-l border-black/5 pl-2">
          {visibleChildren.map((child) => (
            <LeafRow
              key={child.path}
              leaf={child}
              tenantId={tenantId}
              isCollapsed={false}
              currentPath={currentPath}
              activeLeafPath={activeLeafPath}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeafRow({
  leaf,
  tenantId,
  isCollapsed,
  activeLeafPath,
  nested,
}: {
  leaf: NavLeaf;
  tenantId: string | undefined;
  isCollapsed: boolean;
  currentPath: string;
  activeLeafPath: string | undefined;
  nested?: boolean;
}) {
  const { t } = useTranslation();
  const Icon = ICON_MAP[leaf.iconName];
  const isActive = leaf.path === activeLeafPath;
  const href = absolutePath(leaf.path, tenantId);

  if (leaf.external) {
    return (
      <ExternalLeafRow
        leaf={leaf}
        Icon={Icon}
        isCollapsed={isCollapsed}
        nested={nested}
      />
    );
  }

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            to={href}
            className={cn(
              "flex items-center justify-center rounded-xl p-2 transition-colors",
              isActive ? "bg-black/[0.06]" : "hover:bg-black/[0.04]",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                isActive ? "text-black" : "text-black/70",
              )}
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {t(leaf.label)}
          {leaf.comingSoon && ` · ${t("common.soon")}`}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      to={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-black/[0.06] font-medium text-black"
          : "text-black/60 hover:bg-black/[0.04] hover:text-black",
        nested && !isActive && "text-black/70",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "text-black" : "text-black/50",
        )}
      />
      <span className="flex-1 truncate">{t(leaf.label)}</span>
      {leaf.comingSoon && (
        <span className="shrink-0 rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-black/55">
          {t("common.soon")}
        </span>
      )}
    </Link>
  );
}

function ExternalLeafRow({
  leaf,
  Icon,
  isCollapsed,
  nested,
}: {
  leaf: NavLeaf;
  Icon: LucideIcon;
  isCollapsed: boolean;
  nested?: boolean;
}) {
  const { t } = useTranslation();
  // For now, external "Documentation" points at the Swagger UI. Hard-coded
  // here because it isn't a real React route. Swap when we host a dedicated
  // docs site.
  const href = `${import.meta.env.VITE_API_URL ?? ""}/docs`;

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-black/[0.04]"
          >
            <Icon className="h-4 w-4 text-black/70" />
          </a>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {t(leaf.label)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-black/60 transition-colors hover:bg-black/[0.04] hover:text-black",
        nested && "text-black/50",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-black/55" />
      <span className="flex-1 truncate">{t(leaf.label)}</span>
      <ExternalLink className="h-3 w-3 shrink-0 text-black/45" />
    </a>
  );
}

function UserProfileHeader({
  isCollapsed,
}: {
  isCollapsed: boolean;
}) {
  const session = useSession();
  const openProfileModal = useOpenProfileModal();
  if (!session) return null;

  const user = session.user;
  const displayName = pickDisplayName(user);
  const initial = pickInitial(user);

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => openProfileModal()}
            className="flex items-center justify-center rounded-xl p-1 transition-colors hover:bg-black/[0.04]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
              {initial}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {displayName}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openProfileModal()}
      className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-black/[0.04]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
        {initial}
      </span>
      <div className="flex min-w-0 flex-col text-left">
        <span className="truncate text-sm font-medium text-black">
          {displayName}
        </span>
        <span className="truncate text-[11px] text-black/55">
          {user.email}
        </span>
      </div>
    </button>
  );
}

function pickDisplayName(user: AppUser): string {
  if (user.name && user.name.trim() !== "") return user.name;
  // Fall back to the local part of the email — better than showing a raw
  // address as the primary display label.
  const localPart = user.email.split("@")[0];
  return localPart.length > 0 ? localPart : user.email;
}

function pickInitial(user: AppUser): string {
  const source = user.name && user.name.trim() !== "" ? user.name : user.email;
  return source.charAt(0).toUpperCase();
}

function FavoritesSection({
  isCollapsed,
  tenantId,
  pathname,
}: {
  isCollapsed: boolean;
  tenantId: string | undefined;
  pathname: string;
}) {
  const favorites = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const { t } = useTranslation();

  if (favorites.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-0.5 pb-3">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center py-1.5 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {t("nav.favorites")}
          </TooltipContent>
        </Tooltip>
        {favorites.map((fav) => {
          const Icon = ICON_MAP[fav.iconName as NavIconName] ?? Sparkles;
          // Favorites store tenant-agnostic paths (e.g. "/ocean/shipments").
          // Prepend the CURRENT tenant so switching tenants follows the user.
          // Legacy rows that still carry `/app/{oldId}/...` get their id
          // swapped for the same reason; the persist migration cleans them
          // up on next write. Normalising both sides (strip query + trailing
          // slash) keeps index-route pages like "/app/3" matching their
          // favorite path ("") even when earlier navigations left a slash.
          const relative = fav.path
            .replace(/^\/app\/\d+/, "")
            .replace(/\?.*$/, "")
            .replace(/\/$/, "");
          const absolute = `/app/${tenantId}${relative}`;
          const isActive = pathname.replace(/\/$/, "") === absolute;
          return (
            <Tooltip key={fav.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={absolute}
                  className={cn(
                    "flex items-center justify-center rounded-xl p-2 transition-colors",
                    isActive ? "bg-black/[0.06]" : "hover:bg-black/[0.04]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-black" : "text-black/50",
                    )}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {t(fav.title)}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 pb-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-black/55">
        <Star className="h-3 w-3 fill-current text-yellow-500" />
        <span>{t("nav.favorites")}</span>
      </div>
      {favorites.map((fav) => {
        const Icon = ICON_MAP[fav.iconName as NavIconName] ?? Sparkles;
        const relative = fav.path
          .replace(/^\/app\/\d+/, "")
          .replace(/\?.*$/, "")
          .replace(/\/$/, "");
        const absolute = `/app/${tenantId}${relative}`;
        const isActive = pathname.replace(/\/$/, "") === absolute;
        return (
          <div
            key={fav.path}
            className="group flex items-center gap-0.5 rounded-xl"
          >
            <Link
              to={absolute}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-black/[0.06] font-medium text-black"
                  : "text-black/60 hover:bg-black/[0.04] hover:text-black",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-black" : "text-black/50",
                )}
              />
              <span className="flex-1 truncate">{t(fav.title)}</span>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeFavorite(fav.path)}
              className="h-6 w-6 shrink-0 opacity-0 transition-opacity hover:bg-black/[0.04] group-hover:opacity-100"
              aria-label={t("nav.removeFavorite", { title: t(fav.title) })}
            >
              <Star className="h-3 w-3 fill-current text-yellow-500" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
