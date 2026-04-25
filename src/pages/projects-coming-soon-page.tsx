import ComingSoon from "@/components/coming-soon";
import { Folder } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProjectsComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Folder className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.projects")}
      description={t("comingSoon.pageDescriptions.projects")}
      eta={t("comingSoon.eta")}
    />
  );
}
