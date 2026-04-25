import ComingSoon from "@/components/coming-soon";
import { Anchor } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OceanVesselsComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Anchor className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.oceanVessels")}
      description={t("comingSoon.pageDescriptions.oceanVessels")}
      eta={t("comingSoon.eta")}
    />
  );
}
