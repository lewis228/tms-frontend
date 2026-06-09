import { useTranslation } from "react-i18next";

import RatePointList from "@/components/rate-point/rate-point-list";

export default function RatePointsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.rates.ratePoints")}</h1>
      <RatePointList />
    </div>
  );
}
