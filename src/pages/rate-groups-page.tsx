import { useTranslation } from "react-i18next";

import RateGroupList from "@/components/rate-group/rate-group-list";

export default function RateGroupsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.rates.rateGroups")}</h1>
      <RateGroupList />
    </div>
  );
}
