import { useTranslation } from "react-i18next";

import SettlementDrawer from "@/components/settlement/settlement-drawer";
import SettlementList from "@/components/settlement/settlement-list";

export default function AccountingPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.accounting.title")}</h1>
      <SettlementList />
      <SettlementDrawer />
    </div>
  );
}
