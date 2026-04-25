import ComingSoon from "@/components/coming-soon";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AirTrackComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Plus className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.airTrack")}
      description={t("comingSoon.pageDescriptions.airTrack")}
      eta={t("comingSoon.eta")}
    />
  );
}
