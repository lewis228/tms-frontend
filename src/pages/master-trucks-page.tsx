import { useTranslation } from "react-i18next";

import TruckList from "@/components/truck/truck-list";

export default function MasterTrucksPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.trucks")}</h1>
      <TruckList />
    </div>
  );
}
