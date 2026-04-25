import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  REPORT_SERIES,
  REPORT_SERIES_OPTIONS,
  type ReportSeriesKey,
} from "@/components/reports/mock-reports";

// Main overview chart. Tabs swap the dataset; two lines are rendered in
// every mode — solid = This year, dashed = Last year. The first tab
// (shipmentsVolume) is the default view the user confirmed for Phase 1.
// Recharts composition: CartesianGrid (horizontal only) + soft fill under
// `this` line to match the reference aesthetic.
export default function ShipmentsVolumeChart() {
  const { t } = useTranslation();
  const [seriesKey, setSeriesKey] = useState<ReportSeriesKey>(
    "shipmentsVolume",
  );

  const series = REPORT_SERIES[seriesKey];
  const seriesMeta =
    REPORT_SERIES_OPTIONS.find((o) => o.id === seriesKey) ??
    REPORT_SERIES_OPTIONS[0];

  const unitLabel = t(seriesMeta.unitKey);

  // Domain padding so the area doesn't kiss the top of the chart.
  const { minY, maxY } = useMemo(() => {
    const vals = series.flatMap((p) => [p.this, p.last]);
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const pad = (rawMax - rawMin) * 0.15 || rawMax * 0.1;
    return {
      minY: Math.max(0, Math.floor(rawMin - pad)),
      maxY: Math.ceil(rawMax + pad),
    };
  }, [series]);

  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-black/[0.03] p-5">
      {/* Header: tabs on the left, legend dots on the right */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          {REPORT_SERIES_OPTIONS.map((opt) => {
            const isActive = opt.id === seriesKey;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSeriesKey(opt.id)}
                className={cn(
                  "text-sm transition-colors",
                  isActive
                    ? "font-semibold text-black"
                    : "text-black/40 hover:text-black/70",
                )}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-[11px] text-black/55">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            {t("pages.reports.legend.thisYear")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8BB4FF]" />
            {t("pages.reports.legend.lastYear")}
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={series}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[minY, maxY]}
              width={48}
              tickFormatter={(n: number) => formatCompactNumber(n)}
            />
            <RechartTooltip
              cursor={{ stroke: "rgba(0,0,0,0.15)", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.08)",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              labelStyle={{ color: "rgba(0,0,0,0.6)" }}
              formatter={(value, name) => {
                const n = typeof value === "number" ? value : 0;
                const label =
                  name === "this"
                    ? t("pages.reports.legend.thisYear")
                    : t("pages.reports.legend.lastYear");
                return [`${formatFullNumber(n)} ${unitLabel}`, label];
              }}
            />
            {/* Soft fill under the current year only */}
            <Area
              type="monotone"
              dataKey="this"
              stroke="transparent"
              fill="url(#reportFill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="last"
              stroke="#8BB4FF"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="this"
              stroke="#000"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function formatCompactNumber(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return n.toString();
}

function formatFullNumber(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
