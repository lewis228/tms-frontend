import { useTranslation } from "react-i18next";

import TerminalList from "@/components/terminal/terminal-list";

export default function MasterTerminalsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.terminals")}</h1>
      <TerminalList />
    </div>
  );
}
