import { useTranslation } from "react-i18next";

import RateZoneList from "@/components/rate-zone/rate-zone-list";

export default function RateZonesPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.rates.rateZones")}</h1>
      <RateZoneList />
    </div>
  );
}
