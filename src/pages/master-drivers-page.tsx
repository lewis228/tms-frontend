import { useTranslation } from "react-i18next";

import DriverList from "@/components/driver/driver-list";

export default function MasterDriversPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.drivers")}</h1>
      <DriverList />
    </div>
  );
}
