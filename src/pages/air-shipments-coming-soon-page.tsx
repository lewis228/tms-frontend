import ComingSoon from "@/components/coming-soon";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AirShipmentsComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Package className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.airShipments")}
      description={t("comingSoon.pageDescriptions.airShipments")}
      eta={t("comingSoon.eta")}
    />
  );
}
