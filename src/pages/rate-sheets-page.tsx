import { useTranslation } from "react-i18next";

import RateSheetList from "@/components/rate-sheet/rate-sheet-list";

export default function RateSheetsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.rates.rateSheets")}</h1>
      <RateSheetList />
    </div>
  );
}
