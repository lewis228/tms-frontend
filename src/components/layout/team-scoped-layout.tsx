import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import RightPanel from "@/components/layout/right-panel";
import RightPanelResizeHandle from "@/components/layout/right-panel-resize-handle";
import ShipmentDetailSidebar from "@/components/ocean/shipment-detail-sidebar";
import { useSession } from "@/store/session";
import {
  useIsRightPanelCollapsed,
  useRightPanelWidth,
} from "@/store/right-panel";
import { useSetTeamScope } from "@/store/team-scope";
import { toastError } from "@/lib/toast";
import { LAYOUT } from "@/lib/layout-constants";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TeamScopedLayout() {
  const params = useParams();
  const session = useSession();
  const setTeamScope = useSetTeamScope();
  const navigate = useNavigate();
  const isRightPanelCollapsed = useIsRightPanelCollapsed();
  const rightPanelWidth = useRightPanelWidth();
  const [isResizing, setIsResizing] = useState(false);

  const { t } = useTranslation();

  const parsedTeamId = params.teamId ? Number(params.teamId) : NaN;
  const isValidTeamId = !Number.isNaN(parsedTeamId);
  const isMember =
    isValidTeamId &&
    (session?.user.teams.some((team) => team.team_id === parsedTeamId) ??
      false);

  useEffect(() => {
    if (isMember) setTeamScope(parsedTeamId);
    return () => setTeamScope(null);
  }, [parsedTeamId, isMember, setTeamScope]);

  useEffect(() => {
    const handler = () => {
      toastError(t("errors.NOT_TEAM_MEMBER"));
      setTeamScope(null);
      navigate("/app", { replace: true });
    };
    window.addEventListener("team:not-member", handler);
    return () => window.removeEventListener("team:not-member", handler);
  }, [navigate, setTeamScope, t]);

  if (!isValidTeamId || !isMember) {
    return <Navigate to={"/app"} replace={true} />;
  }

  // Shell architecture: the outer container is locked to viewport height
  // (`h-screen overflow-hidden`) so the document itself never scrolls. Each
  // column owns its own scroll. This is the Slack/Linear pattern — sidebars
  // stay put while the page content area scrolls independently.
  //
  //   ┌─────────┬─────────────────────────┬───────────┐
  //   │         │ Header (shrink-0)       │           │
  //   │ Sidebar │─────────────────────────│ RightPanel│
  //   │ (h-full │ Main (flex-1,           │ (h-full,  │
  //   │  scroll │  scrolls both axes)     │  scroll)  │
  //   │  inside)│                         │           │
  //   └─────────┴─────────────────────────┴───────────┘
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />

      {/* `min-w-0` lets the middle column shrink below its content's
          natural width. Without it, flex items refuse to shrink and wide
          children push the right panel off-screen. */}
      <div className="flex flex-1 min-w-0 flex-col">
        <Header />
        {/* `overflow-x-auto` lets wide tables trigger horizontal scroll
            within the content area rather than clipping. The inner
            min-width wrapper guarantees every page has a sensible floor so
            nothing squishes against the right panel — pages that need a
            wider floor use <PageShell minWidth={...}> to override.
            Analogous to Flutter's ConstrainedBox wrapping the ShellRoute
            body. Central value lives in lib/layout-constants.ts.
            The `[&_[data-slot=table-container]]:overflow-visible` variant
            neutralises the shadcn Table's internal overflow-x-auto so the
            main column owns the ONLY horizontal scrollbar — prevents the
            doubled-scrollbar glitch when a wide table lives inside a
            narrow viewport. */}
        <main className="flex-1 overflow-x-auto overflow-y-auto [&_[data-slot=table-container]]:overflow-visible">
          <div
            className="h-full"
            style={{ minWidth: `${LAYOUT.defaultMinWidth}px` }}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {!isRightPanelCollapsed && (
        <RightPanelResizeHandle onResizingChange={setIsResizing} />
      )}

      <aside
        className="h-full shrink-0 overflow-hidden"
        style={{
          width: isRightPanelCollapsed ? 0 : rightPanelWidth,
          transition: isResizing ? "none" : "width 300ms ease",
        }}
      >
        <RightPanel />
      </aside>

      {/* Floating shipment detail sidebar — overlays the whole shell
          (including RightPanel) when a Shipment / Container row is clicked
          from any list page. Closed by default, controlled via zustand. */}
      <ShipmentDetailSidebar />
    </div>
  );
}
