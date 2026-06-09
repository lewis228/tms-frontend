import { useTranslation } from "react-i18next";

import DriverRateAssignmentList from "@/components/driver-rate-assignment/driver-rate-assignment-list";

export default function DriverRateAssignmentsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">
        {t("pages.rates.driverRateAssignments")}
      </h1>
      <DriverRateAssignmentList />
    </div>
  );
}
