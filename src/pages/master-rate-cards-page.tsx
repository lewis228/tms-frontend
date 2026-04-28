import { useTranslation } from "react-i18next";

import RateCardList from "@/components/rate-card/rate-card-list";

export default function MasterRateCardsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.rateCards")}</h1>
      <RateCardList />
    </div>
  );
}
