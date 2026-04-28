import { useTranslation } from "react-i18next";

import ChargeCodeList from "@/components/charge-code/charge-code-list";

export default function MasterChargeCodesPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.chargeCodes")}</h1>
      <ChargeCodeList />
    </div>
  );
}
