import { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ReportKpi } from "@/components/reports/mock-reports";

// A single card from the 4-up KPI strip. Pastel tint, label + big number,
// delta pill, and a tiny sparkline. Built as an inline SVG polyline so no
// extra dep — recharts is reserved for the larger charts below.
export default function ReportKpiCard({ kpi }: { kpi: ReportKpi }) {
  const { t } = useTranslation();
  const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;

  const display = kpi.displayValue ?? kpi.value.toLocaleString();

  // Normalise spark values into an SVG polyline. Points fit inside a
  // 60×20 viewBox so the card can render it inline without layout shift.
  const sparkPath = useMemo(() => {
    const values = kpi.spark;
    if (values.length === 0) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const stepX = 60 / Math.max(1, values.length - 1);
    return values
      .map((v, i) => {
        const x = (i * stepX).toFixed(2);
        const y = (20 - ((v - min) / span) * 18 - 1).toFixed(2);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [kpi.spark]);

  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl p-5", kpi.tint)}>
      <span className="text-xs font-medium text-black/70">
        {t(kpi.labelKey)}
      </span>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[30px] font-semibold leading-none text-black">
            {display}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-medium",
              kpi.trend === "up" ? "text-emerald-700" : "text-rose-700",
            )}
          >
            {kpi.deltaPercent > 0 ? "+" : ""}
            {kpi.deltaPercent.toFixed(2)}%
            <TrendIcon className="h-3 w-3" />
          </span>
        </div>
        <svg
          viewBox="0 0 60 20"
          width="60"
          height="20"
          fill="none"
          className="shrink-0"
          aria-hidden
        >
          <path
            d={sparkPath}
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black/60"
          />
        </svg>
      </div>
    </div>
  );
}
