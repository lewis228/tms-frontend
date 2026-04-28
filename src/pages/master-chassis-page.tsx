import { useTranslation } from "react-i18next";

import ChassisList from "@/components/chassis/chassis-list";

export default function MasterChassisPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.chassis")}</h1>
      <ChassisList />
    </div>
  );
}
