import ComingSoon from "@/components/coming-soon";
import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TerminalAppointmentsComingSoonPage() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      icon={<CalendarClock className="h-7 w-7" />}
      title={t("comingSoon.pageTitles.terminalAppointments")}
      description={t("comingSoon.pageDescriptions.terminalAppointments")}
      eta={t("comingSoon.eta")}
    />
  );
}
