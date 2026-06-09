import { useTranslation } from "react-i18next";

import RateMultiplierManager from "@/components/rate-multiplier/rate-multiplier-manager";

export default function RateMultipliersPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">
        {t("pages.rates.rateMultipliers")}
      </h1>
      <p className="text-sm text-muted-foreground">
        {t("rateMultiplier.description")}
      </p>
      <RateMultiplierManager />
    </div>
  );
}
