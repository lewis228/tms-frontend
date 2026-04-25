import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COST_COLORS, COST_STACK } from "@/components/reports/mock-reports";

const SEGMENT_LABEL_KEYS = {
  demurrage: "pages.reports.costBreakdown.segments.demurrage",
  perDiem: "pages.reports.costBreakdown.segments.perDiem",
  other: "pages.reports.costBreakdown.segments.other",
} as const;

// Stacked bar chart showing the composition of accessorial fees month
// over month. Each segment (Demurrage / Per Diem / Other) stacks in a
// fixed order so the bottom band is always the same category — users
// can then read visual trends without re-checking the legend.
export default function CostBreakdownChart() {
  const { t } = useTranslation();

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl bg-black/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-black">
          {t("pages.reports.costBreakdown.title")}
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-black/55">
          {(Object.keys(SEGMENT_LABEL_KEYS) as (keyof typeof SEGMENT_LABEL_KEYS)[]).map(
            (seg) => (
              <span key={seg} className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: COST_COLORS[seg] }}
                />
                {t(SEGMENT_LABEL_KEYS[seg])}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={COST_STACK}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="45%"
          >
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
              width={44}
              tickFormatter={(n: number) => formatUsdCompact(n)}
            />
            <RechartTooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.08)",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              labelStyle={{ color: "rgba(0,0,0,0.6)" }}
              formatter={(value, name) => {
                const n = typeof value === "number" ? value : 0;
                const key = SEGMENT_LABEL_KEYS[name as keyof typeof SEGMENT_LABEL_KEYS];
                return [
                  `$${n.toLocaleString()}`,
                  key ? t(key) : String(name),
                ];
              }}
            />
            <Bar
              dataKey="demurrage"
              stackId="cost"
              fill={COST_COLORS.demurrage}
              maxBarSize={24}
            />
            <Bar
              dataKey="perDiem"
              stackId="cost"
              fill={COST_COLORS.perDiem}
              maxBarSize={24}
            />
            <Bar
              dataKey="other"
              stackId="cost"
              fill={COST_COLORS.other}
              maxBarSize={24}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function formatUsdCompact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `$${k >= 10 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `$${n}`;
}
