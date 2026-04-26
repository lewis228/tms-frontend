import { useTranslation } from "react-i18next";

import TenantList from "@/components/tenant/tenant-list";

export default function SystemTenantsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.system.tenants")}</h1>
      <p className="text-xs text-muted-foreground">
        {t("pages.system.tenantsHint")}
      </p>
      <TenantList />
    </div>
  );
}
