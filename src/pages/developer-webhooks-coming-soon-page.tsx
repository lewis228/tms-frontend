import ComingSoon from "@/components/coming-soon";
import { Webhook } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DeveloperWebhooksComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<Webhook className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.developerWebhooks")}
      description={t("comingSoon.pageDescriptions.developerWebhooks")}
      eta={t("comingSoon.eta")}
    />
  );
}
