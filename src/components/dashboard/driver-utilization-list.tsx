// Driver utilization 리스트 (최근 N 일) — H-9 신규.
import { useTranslation } from "react-i18next";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useDriverUtilizationData } from "@/hooks/queries/use-analytics-data";

export default function DriverUtilizationList({ days = 7 }: { days?: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useDriverUtilizationData(days);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const rows = data.rows;

  return (
    <section className="rounded-md border bg-background p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("dashboard.section.driverUtilization")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("dashboard.section.driverUtilizationHint", { days })}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          {t("common.noData")}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => {
            const pct = Math.min(100, Math.max(0, r.utilizationPct));
            const tone =
              pct >= 70
                ? "bg-emerald-500"
                : pct >= 40
                  ? "bg-amber-500"
                  : "bg-red-500";
            return (
              <div key={r.driverId} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{r.driverName}</span>
                  <span className="font-mono text-muted-foreground">
                    {r.completedLegs}/{r.totalLegs} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded bg-muted">
                  <div
                    className={`h-full ${tone}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
