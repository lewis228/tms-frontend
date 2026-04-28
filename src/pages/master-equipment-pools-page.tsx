import { useTranslation } from "react-i18next";

import EquipmentPoolList from "@/components/equipment-pool/equipment-pool-list";

export default function MasterEquipmentPoolsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.equipmentPools")}</h1>
      <EquipmentPoolList />
    </div>
  );
}
