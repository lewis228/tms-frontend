import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { PORT_DWELL } from "@/components/reports/mock-reports";

// Horizontal bar chart showing average container dwell time per port.
// Bars crossing the threshold (dashed reference line) are tinted amber
// as a quick visual tell for demurrage risk ports. Layout is horizontal
// (`layout="vertical"`) so long port names don't get truncated.
export default function DwellTimeChart() {
  const { t } = useTranslation();

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl bg-black/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">
          {t("pages.reports.dwellTime.title")}
        </h3>
        <span className="text-[11px] text-black/55">
          {t("pages.reports.dwellTime.unit")}
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={PORT_DWELL}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis
              type="number"
              tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, "dataMax + 1"]}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "rgba(0,0,0,0.55)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={84}
            />
            <ReferenceLine
              x={PORT_DWELL[0]?.threshold ?? 5}
              stroke="rgba(239,68,68,0.5)"
              strokeDasharray="4 4"
            />
            <RechartTooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.08)",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              formatter={(value) => {
                const n = typeof value === "number" ? value : 0;
                return [
                  t("pages.reports.dwellTime.valueLabel", {
                    days: n.toFixed(1),
                  }),
                  "",
                ];
              }}
            />
            <Bar dataKey="days" radius={[0, 8, 8, 0]} maxBarSize={18}>
              {PORT_DWELL.map((row) => (
                <Cell
                  key={row.id}
                  fill={row.days > row.threshold ? "#F59E0B" : "#1A1A1A"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
