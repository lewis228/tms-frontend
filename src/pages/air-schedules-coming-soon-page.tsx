import ComingSoon from "@/components/coming-soon";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AirSchedulesComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Calendar className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.airSchedules")}
      description={t("comingSoon.pageDescriptions.airSchedules")}
      eta={t("comingSoon.eta")}
    />
  );
}
