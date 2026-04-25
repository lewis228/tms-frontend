import ComingSoon from "@/components/coming-soon";
import { Container } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TerminalContainersComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Container className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.terminalContainers")}
      description={t("comingSoon.pageDescriptions.terminalContainers")}
      eta={t("comingSoon.eta")}
    />
  );
}
