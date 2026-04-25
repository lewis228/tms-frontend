import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import LiveMap from "@/components/live-map/live-map";

// Live Map subpage of the Dashboard. Shell matches the other sub-pages
// (title + tabs + content) so the tab strip stays pinned as users move
// between Overview / Live Map / Alerts / Settings. Map + side panel
// live in `components/live-map/live-map.tsx`.
export default function LiveMapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const teamId = params.teamId;

  return (
    <div className="flex h-[calc(100svh-68px)] flex-col gap-6 overflow-hidden p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("pages.liveMap.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("pages.liveMap.subtitle")}
        </p>
      </div>

      <DashboardTabs
        onTrackClick={() => navigate(`/app/${teamId}/ocean/track`)}
      />

      <LiveMap />
    </div>
  );
}
