import { useTranslation } from "react-i18next";

import CustomerList from "@/components/customer/customer-list";

export default function MasterCustomersPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.customers")}</h1>
      <CustomerList />
    </div>
  );
}
