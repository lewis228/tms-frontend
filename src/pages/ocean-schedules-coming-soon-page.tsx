import ComingSoon from "@/components/coming-soon";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OceanSchedulesComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Calendar className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.oceanSchedules")}
      description={t("comingSoon.pageDescriptions.oceanSchedules")}
      eta={t("comingSoon.eta")}
    />
  );
}
