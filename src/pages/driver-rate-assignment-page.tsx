import { useTranslation } from "react-i18next";

import DriverRateAssignmentList from "@/components/driver-rate-assignment/driver-rate-assignment-list";

export default function DriverRateAssignmentPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">
        {t("driverRateAssignment.pageTitle")}
      </h1>
      <p className="text-sm text-muted-foreground">
        {t("driverRateAssignment.pageSubtitle")}
      </p>

      <DriverRateAssignmentList />
    </div>
  );
}
