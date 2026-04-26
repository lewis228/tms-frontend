import { useTranslation } from "react-i18next";

import SystemUserList from "@/components/system-user/system-user-list";

export default function SystemUsersPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.system.users")}</h1>
      <p className="text-xs text-muted-foreground">
        {t("pages.system.usersHint")}
      </p>
      <SystemUserList />
    </div>
  );
}
