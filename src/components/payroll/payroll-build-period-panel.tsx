// 정산 일괄 생성(build-period) 패널 + 기간 집계 strip.
// settlements 페이지 상단 툴바. 기간(periodStart/periodEnd) + 선택적 드라이버 목록 → POST /build-period.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { X } from "lucide-react";

import { fetchDriver, fetchDrivers } from "@/api/driver";
import SearchableSelect from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePayrollPeriodSummaryData } from "@/hooks/queries/use-payroll-period-summary-data";
import { useBuildPeriodPayroll } from "@/hooks/mutations/payroll/use-build-period-payroll";
import { formatAmount } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import type { DriverEntity } from "@/types";

const SEARCH_SIZE = 50;

export default function PayrollBuildPeriodPanel() {
  const { t } = useTranslation();
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [drivers, setDrivers] = useState<DriverEntity[]>([]);
  const [pickerKey, setPickerKey] = useState(0);

  const hasRange = periodStart !== "" && periodEnd !== "";

  const { data: summary } = usePayrollPeriodSummaryData(
    hasRange ? periodStart : null,
    hasRange ? periodEnd : null,
  );

  const { mutate: buildPeriod, isPending: isBuildPeriodPending } =
    useBuildPeriodPayroll({
      onSuccess: (data) => {
        toast.success(
          t("payroll.buildPeriod.result", {
            built: data.builtCount,
            skipped: data.skippedDrivers.length,
          }),
          { position: "top-center" },
        );
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const handleAddDriver = (item: DriverEntity | null) => {
    if (!item) return;
    setDrivers((prev) =>
      prev.some((d) => d.id === item.id) ? prev : [...prev, item],
    );
    // reset the picker so the same control can pick again
    setPickerKey((k) => k + 1);
  };

  const handleRemoveDriver = (id: number) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  const handleBuild = () => {
    if (!hasRange) return;
    if (periodEnd < periodStart) {
      toast.error(t("payroll.invalidRange"), { position: "top-center" });
      return;
    }
    buildPeriod({
      periodStart,
      periodEnd,
      driverIds: drivers.length > 0 ? drivers.map((d) => d.id) : null,
    });
  };

  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground text-xs">
            {t("payroll.field.periodStart")}
          </label>
          <Input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            disabled={isBuildPeriodPending}
            className="w-44"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground text-xs">
            {t("payroll.field.periodEnd")}
          </label>
          <Input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            disabled={isBuildPeriodPending}
            className="w-44"
          />
        </div>
        <div className="flex min-w-56 flex-col gap-1">
          <label className="text-muted-foreground text-xs">
            {t("payroll.buildPeriod.driversOptional")}
          </label>
          <SearchableSelect<DriverEntity>
            key={pickerKey}
            value={null}
            onSelect={(_id, item) => handleAddDriver(item)}
            fetchList={(q) =>
              fetchDrivers({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchDriver(id)}
            queryKeyBase={["driver", "search"]}
            getLabel={(d) => d.name}
            placeholder={t("payroll.buildPeriod.addDriver")}
            disabled={isBuildPeriodPending}
          />
        </div>
        <Button
          onClick={handleBuild}
          disabled={!hasRange || isBuildPeriodPending}
        >
          {t("payroll.buildPeriod.button")}
        </Button>
      </div>

      {drivers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {drivers.map((d) => (
            <span
              key={d.id}
              className="bg-muted flex items-center gap-1 rounded-full px-3 py-1 text-xs"
            >
              {d.name}
              <button
                type="button"
                onClick={() => handleRemoveDriver(d.id)}
                disabled={isBuildPeriodPending}
                aria-label={t("common.remove")}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {hasRange && summary && (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-1 border-t pt-3 text-sm">
          <span>
            {t("payroll.summary.driverCount")}:{" "}
            <span className="text-foreground font-medium">
              {summary.driverCount.toLocaleString()}
            </span>
          </span>
          <span>
            {t("payroll.summary.count")}:{" "}
            <span className="text-foreground font-medium">
              {summary.count.toLocaleString()}
            </span>
          </span>
          <span>
            {t("payroll.summary.grandTotal")}:{" "}
            <span className="text-foreground font-medium">
              {formatAmount(summary.grandTotal)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
