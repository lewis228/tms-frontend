import { useTranslation } from "react-i18next";

import AddonList from "@/components/addon/addon-list";

export default function MasterAddonsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.addons")}</h1>
      <AddonList />
    </div>
  );
}
