import { useTranslation } from "react-i18next";

import InvoiceList from "@/components/invoice/invoice-list";

export default function InvoicesPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("invoice.title")}</h1>
      <InvoiceList />
    </div>
  );
}
