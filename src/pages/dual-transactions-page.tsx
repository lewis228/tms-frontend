import { useTranslation } from "react-i18next";

import DualTransactionList from "@/components/dual-transaction/dual-transaction-list";

export default function DualTransactionsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("pages.dualTransactions")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("dualTransaction.pageHint")}
        </p>
      </div>
      <DualTransactionList />
    </div>
  );
}
