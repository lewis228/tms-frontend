import { useTranslation } from "react-i18next";

import RateSettingList from "@/components/rate-setting/rate-setting-list";

export default function AccountingRatesPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">
        {t("pages.accountingRates.title")}
      </h1>
      <p className="text-xs text-muted-foreground">
        {t("pages.accountingRates.hint")}
      </p>
      <RateSettingList />
    </div>
  );
}
