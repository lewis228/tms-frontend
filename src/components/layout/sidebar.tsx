import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Anchor,
  BadgeDollarSign,
  Bell,
  Building2,
  ChevronDown,
  Container,
  CreditCard,
  Folder,
  Key,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Palette,
  Plug,
  Receipt,
  Server,
  Settings,
  ShieldCheck,
  Ship,
  Sparkles,
  Star,
  Tag,
  Truck,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TeamSwitcher from "@/components/layout/team-switcher";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useIsSidebarCollapsed } from "@/store/sidebar";
import { useFavorites, useRemoveFavorite } from "@/store/favorites";
import { useCurrentRole, useCurrentUser } from "@/store/auth";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { useOpenProfileModal } from "@/store/profile-modal";
import type { UserEntity } from "@/types";
import {
  resolveNavMatch,
  visibleNavFor,
  type NavIconName,
  type NavLeaf,
  type NavNode,
  type NavSection,
} from "@/lib/nav-config";
import { cn } from "@/lib/utils";

// Icon lookup — keep in sync with NavIconName union. Having this as a local
// map lets nav-config.ts stay serialisable (needed for the favourites store).
const ICON_MAP: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  Truck,
  Wallet,
  Folder,
  Settings,
  Server,
  Users,
  User,
  Building2,
  Map,
  Anchor,
  Container,
  Ship,
  MapPin,
  Bell,
  ShieldCheck,
  Palette,
  Receipt,
  BadgeDollarSign,
  Tag,
  Plug,
  CreditCard,
  Key,
};

// Build an absolute `/app/:teamId/...` URL from a nav leaf's relative path.
// Falls back to `/app` when the component is rendered outside a team scope.
function absolutePath(
  relativePath: string,
  teamId: string | undefined,
): string {
  if (!teamId) return "/app";
  if (relativePath === "") return `/app/${teamId}`;
  return `/app/${teamId}/${relativePath}`;
}

export default function Sidebar() {
  const role = useCurrentRole();
  const user = useCurrentUser();
  const location = useLocation();
  const params = useParams();
  const isCollapsed = useIsSidebarCollapsed();
  const openAlertModal = useOpenAlertModal();
  const { t } = useTranslation();
  const teamId = params.teamId;

  // useSignOut hook 이 백엔드 /auth/logout 호출 → clearAuth → announceLogout (다른 탭).
  // onSuccess/onError 둘 다 sign-in 으로 hard reload (axios refreshPromise 등 정리).
  const { mutate: signOut } = useSignOut({
    onSuccess: () => {
      window.location.href = "/sign-in";
    },
    onError: () => {
      window.location.href = "/sign-in";
    },
  });

  const handleSignOutClick = () => {
    openAlertModal({
      title: t("profile.signOutConfirmTitle"),
      description: t("profile.signOutConfirmDescription"),
      onPositive: () => signOut(),
    });
  };

  // Filter nav by role and pre-compute the active nav match so sections
  // auto-expand to reveal the active leaf.
  const visibleNodes = useMemo(() => visibleNavFor(role), [role]);
  const teamPrefix = teamId ? `/app/${teamId}` : "";
  const relativePath =
    location.pathname.startsWith(teamPrefix + "/")
      ? location.pathname.slice(teamPrefix.length + 1)
      : location.pathname === teamPrefix
        ? ""
        : location.pathname;

  const activeMatch = useMemo(
    () => resolveNavMatch(relativePath),
    [relativePath],
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
          <UserProfileHeader isCollapsed={isCollapsed} user={user} />
        </div>

        <div className="pb-3">
          <TeamSwitcher isCollapsed={isCollapsed} />
        </div>

        <FavoritesSection
          isCollapsed={isCollapsed}
          teamId={teamId}
          pathname={location.pathname}
        />

        <nav className="flex flex-col gap-0.5 pb-3">
          {visibleNodes.map((node) => (
            <NavNodeRow
              key={nodeKey(node)}
              node={node}
              teamId={teamId}
              isCollapsed={isCollapsed}
              currentPath={location.pathname}
              activeLeafPath={activeMatch?.leaf.path}
              activeSectionLabel={activeMatch?.section?.label ?? null}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pb-4">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleSignOutClick}
                className={cn(
                  "flex items-center rounded-xl py-1.5 text-sm text-black/55 transition-colors hover:text-black",
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
  teamId,
  isCollapsed,
  currentPath,
  activeLeafPath,
  activeSectionLabel,
}: {
  node: NavNode;
  teamId: string | undefined;
  isCollapsed: boolean;
  currentPath: string;
  activeLeafPath: string | undefined;
  activeSectionLabel: string | null;
}) {
  if (node.type === "leaf") {
    if (node.hidden) return null;
    return (
      <LeafRow
        leaf={node}
        teamId={teamId}
        isCollapsed={isCollapsed}
        currentPath={currentPath}
        activeLeafPath={activeLeafPath}
      />
    );
  }
  return (
    <SectionRow
      section={node}
      teamId={teamId}
      isCollapsed={isCollapsed}
      currentPath={currentPath}
      activeLeafPath={activeLeafPath}
      defaultExpanded={activeSectionLabel === node.label}
    />
  );
}

function SectionRow({
  section,
  teamId,
  isCollapsed,
  currentPath,
  activeLeafPath,
  defaultExpanded,
}: {
  section: NavSection;
  teamId: string | undefined;
  isCollapsed: boolean;
  currentPath: string;
  activeLeafPath: string | undefined;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { t } = useTranslation();
  const Icon = ICON_MAP[section.iconName];

  const visibleChildren = section.children.filter((c) => !c.hidden);
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
            teamId={teamId}
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
              teamId={teamId}
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
  teamId,
  isCollapsed,
  activeLeafPath,
  nested,
}: {
  leaf: NavLeaf;
  teamId: string | undefined;
  isCollapsed: boolean;
  currentPath: string;
  activeLeafPath: string | undefined;
  nested?: boolean;
}) {
  const { t } = useTranslation();
  const Icon = ICON_MAP[leaf.iconName];
  const isActive = leaf.path === activeLeafPath;
  const href = absolutePath(leaf.path, teamId);

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
    </Link>
  );
}

function UserProfileHeader({
  isCollapsed,
  user,
}: {
  isCollapsed: boolean;
  user: UserEntity | null;
}) {
  const openProfileModal = useOpenProfileModal();
  if (!user) return null;

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
          {user.email ?? ""}
        </span>
      </div>
    </button>
  );
}

function pickDisplayName(user: UserEntity): string {
  if (user.name && user.name.trim() !== "") return user.name;
  const email = user.email ?? "";
  const localPart = email.split("@")[0];
  return localPart.length > 0 ? localPart : email || "—";
}

function pickInitial(user: UserEntity): string {
  const source =
    user.name && user.name.trim() !== "" ? user.name : user.email ?? "";
  return (source.charAt(0) || "?").toUpperCase();
}

function FavoritesSection({
  isCollapsed,
  teamId,
  pathname,
}: {
  isCollapsed: boolean;
  teamId: string | undefined;
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
            {t("favorites.title")}
          </TooltipContent>
        </Tooltip>
        {favorites.map((fav) => {
          const Icon = ICON_MAP[fav.iconName as NavIconName] ?? Sparkles;
          // Favorites store team-agnostic relative paths. Build the absolute
          // URL with the CURRENT team so switching teams preserves them.
          const relative = fav.path
            .replace(/^\/app\/\d+/, "")
            .replace(/\?.*$/, "")
            .replace(/^\//, "")
            .replace(/\/$/, "");
          const absolute = teamId
            ? `/app/${teamId}/${relative}`.replace(/\/$/, "")
            : "/app";
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
        <span>{t("favorites.title")}</span>
      </div>
      {favorites.map((fav) => {
        const Icon = ICON_MAP[fav.iconName as NavIconName] ?? Sparkles;
        const relative = fav.path
          .replace(/^\/app\/\d+/, "")
          .replace(/\?.*$/, "")
          .replace(/^\//, "")
          .replace(/\/$/, "");
        const absolute = teamId
          ? `/app/${teamId}/${relative}`.replace(/\/$/, "")
          : "/app";
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
              aria-label={t("favorites.removeFromFavorites")}
            >
              <Star className="h-3 w-3 fill-current text-yellow-500" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
