import {
  Search,
  Sun,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import AnnouncementsPopover from "@/components/layout/announcements-popover";
import { useIsSidebarCollapsed, useToggleSidebar } from "@/store/sidebar";
import {
  useIsRightPanelCollapsed,
  useToggleRightPanel,
} from "@/store/right-panel";
import { useIsFavorited, useToggleFavorite } from "@/store/favorites";
import { resolveBreadcrumb, resolveFavoriteMeta } from "@/lib/breadcrumb";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

export default function Header() {
  const toggleSidebar = useToggleSidebar();
  const toggleRightPanel = useToggleRightPanel();
  const isSidebarOpen = !useIsSidebarCollapsed();
  const isRightPanelOpen = !useIsRightPanelCollapsed();
  const location = useLocation();
  const { t } = useTranslation();
  const crumbs = resolveBreadcrumb(location.pathname);

  // Star button toggles the current page in/out of the sidebar Favorites.
  // We derive the display metadata from the same breadcrumb source of truth so
  // the favorite label always matches the breadcrumb the user sees.
  //
  // IMPORTANT: favorites store team-agnostic paths (no `/app/:teamId` prefix)
  // so a favorite pinned in team A still resolves to the equivalent page in
  // team B after switching teams. We strip the prefix here before save/query,
  // and the sidebar re-prepends the current team id at render time.
  const favoritePath = `${location.pathname.replace(/^\/app\/\d+/, "")}${location.search}`;
  const isFavorited = useIsFavorited(favoritePath);
  const toggleFavorite = useToggleFavorite();
  const favoriteMeta = resolveFavoriteMeta(location.pathname);

  const handleToggleFavorite = () => {
    if (!favoriteMeta) return;
    toggleFavorite({
      path: favoritePath,
      title: favoriteMeta.title,
      iconName: favoriteMeta.iconName,
    });
  };

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-black/10 bg-white px-7">
        {/* Left: Icons + Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "h-8 w-8 transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-black/[0.04] active:scale-95 focus-visible:ring-1 focus-visible:ring-black/10",
                "text-black/55 hover:text-black/80",
                // Hide on narrow viewports when the sidebar is already open.
                // The toggle only earns its place when space is tight AND it
                // offers a reopen affordance — otherwise it just competes
                // with the right panel's content for horizontal space.
                isSidebarOpen
                  ? "hidden xl:inline-flex"
                  : "inline-flex",
              )}
              aria-label={t("header.toggleSidebar")}
            >
              <span className="relative block h-4 w-4">
                <PanelLeftOpen
                  className={cn(
                    "absolute inset-0 h-4 w-4 transition-opacity duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isSidebarOpen && "opacity-0",
                  )}
                />
                <PanelLeftClose
                  className={cn(
                    "absolute inset-0 h-4 w-4 transition-opacity duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    !isSidebarOpen && "opacity-0",
                  )}
                />
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={!favoriteMeta}
              className={cn(
                "h-8 w-8 transition-colors hover:bg-black/[0.04]",
                isFavorited
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-black/20 hover:text-black",
              )}
              aria-label={
                isFavorited
                  ? t("header.unfavoriteThisPage")
                  : t("header.favoriteThisPage")
              }
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorited && "fill-current",
                )}
              />
            </Button>
          </div>
          {/* Breadcrumb — derived from URL so it stays in sync with the
              sidebar's active item. Last crumb is the current page (bolder). */}
          <nav className="flex items-center gap-1 text-xs">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              // Crumbs from NAV_CONFIG are i18n keys ("nav.*"); humanised
              // extras (detail page ids, unknown routes) pass through t()
              // unchanged because they aren't in the bundle.
              return (
                <span key={`${crumb}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <span className="text-black/10">/</span>}
                  <span className={isLast ? "text-black" : "text-black/55"}>
                    {t(crumb)}
                  </span>
                </span>
              );
            })}
          </nav>
        </div>

        {/* Right: Search + Icons */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 rounded-2xl bg-black/[0.04] px-3 py-1.5">
            <Search className="h-[13px] w-[13px] text-black/20" />
            <span className="text-sm text-black/20">
              {t("header.searchPlaceholder")}
            </span>
            <span className="ml-6 text-xs text-black/20">/</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-black/55 hover:bg-black/[0.04] hover:text-black"
              aria-label={t("header.theme")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <AnnouncementsPopover />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRightPanel}
              className={cn(
                "h-8 w-8 transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-black/[0.04] active:scale-95 focus-visible:ring-1 focus-visible:ring-black/10",
                "text-black/55 hover:text-black/80",
                // Same policy as the left toggle — hide on narrow viewports
                // when the panel is already open so it stops colliding with
                // the chat list peeking in from the right.
                isRightPanelOpen
                  ? "hidden xl:inline-flex"
                  : "inline-flex",
              )}
              aria-label={t("header.rightPanel")}
            >
              <span className="relative block h-4 w-4">
                <PanelRightOpen
                  className={cn(
                    "absolute inset-0 h-4 w-4 transition-opacity duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isRightPanelOpen && "opacity-0",
                  )}
                />
                <PanelRightClose
                  className={cn(
                    "absolute inset-0 h-4 w-4 transition-opacity duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    !isRightPanelOpen && "opacity-0",
                  )}
                />
              </span>
            </Button>
          </div>
        </div>
    </header>
  );
}
