import { useTranslation } from "react-i18next";

import DriverScheduleGantt from "@/components/dispatch/driver-schedule-gantt";

export default function DriverSchedulePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">
        {t("pages.driverSchedule.title")}
      </h1>
      <p className="text-xs text-muted-foreground">
        {t("pages.driverSchedule.hint")}
      </p>
      <DriverScheduleGantt />
    </div>
  );
}
