import { useTranslation } from "react-i18next";

import StreetTurnList from "@/components/street-turn/street-turn-list";
import StreetTurnCandidatesCard from "@/components/street-turn/street-turn-candidates-card";

export default function StreetTurnsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("pages.streetTurns")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("streetTurn.pageHint")}
        </p>
      </div>
      <StreetTurnCandidatesCard />
      <StreetTurnList />
    </div>
  );
}
