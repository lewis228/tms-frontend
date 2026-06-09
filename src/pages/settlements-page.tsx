import { useTranslation } from "react-i18next";

import PayrollBuildPeriodPanel from "@/components/payroll/payroll-build-period-panel";
import SettlementList from "@/components/payroll/settlement-list";

export default function SettlementsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("payroll.title")}</h1>
      <PayrollBuildPeriodPanel />
      <SettlementList />
    </div>
  );
}
