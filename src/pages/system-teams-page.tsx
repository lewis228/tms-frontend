import { useTranslation } from "react-i18next";

import TeamList from "@/components/team/team-list";

export default function SystemTeamsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.system.teams")}</h1>
      <p className="text-xs text-muted-foreground">
        {t("pages.system.teamsHint")}
      </p>
      <TeamList />
    </div>
  );
}
