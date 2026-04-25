import ComingSoon from "@/components/coming-soon";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RailTrackComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Plus className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.railTrack")}
      description={t("comingSoon.pageDescriptions.railTrack")}
      eta={t("comingSoon.eta")}
    />
  );
}
