import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabDef = {
  id: "overview" | "liveMap" | "alerts" | "settings";
  /** relative path under `/app/:teamId` */
  to: string;
  /** when true, NavLink's `end` prop is used so "/app/:teamId" doesn't
   * stay active after navigating to a sibling path */
  end?: boolean;
};

const TABS: TabDef[] = [
  { id: "overview", to: "", end: true },
  { id: "liveMap", to: "live-map" },
  { id: "alerts", to: "alerts" },
  { id: "settings", to: "dashboard-settings" },
];

// Top row of the dashboard: subpage tabs wired to real routes + primary
// action buttons. NavLink handles active highlighting automatically so
// this component is stateless — URL is the source of truth.
export default function DashboardTabs({
  onTrackClick,
}: {
  onTrackClick?: () => void;
}) {
  const { t } = useTranslation();
  const params = useParams();
  const teamId = params.teamId;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-3">
      <nav className="flex items-center gap-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={`/app/${teamId}${tab.to ? `/${tab.to}` : ""}`}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                "relative pb-2 text-sm transition-colors",
                isActive
                  ? "font-medium text-black"
                  : "text-black/55 hover:text-black",
              )
            }
          >
            {({ isActive }) => (
              <>
                {t(`pages.dashboard.tabs.${tab.id}`)}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[13px] h-[2px] rounded-full bg-black" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onTrackClick}
          className="h-8 rounded-full bg-black px-3 text-xs text-white hover:bg-black/80"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("pages.dashboard.actions.trackMbl")}
        </Button>
      </div>
    </div>
  );
}
