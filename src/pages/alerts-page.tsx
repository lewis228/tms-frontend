import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AlertsList from "@/components/alerts/alerts-list";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";

export default function AlertsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const teamId = params.teamId;

  return (
    <div className="flex h-[calc(100svh-68px)] flex-col gap-6 overflow-hidden p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("pages.alerts.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("pages.alerts.subtitle")}
        </p>
      </div>

      <DashboardTabs
        onTrackClick={() => navigate(`/app/${teamId}/ocean/track`)}
      />

      <AlertsList />
    </div>
  );
}
