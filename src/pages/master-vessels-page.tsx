import { useTranslation } from "react-i18next";

import VesselList from "@/components/vessel/vessel-list";

export default function MasterVesselsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.vessels")}</h1>
      <VesselList />
    </div>
  );
}
