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
} from "recharts";
import { CARRIER_PERFORMANCE } from "@/components/reports/mock-reports";

// "Traffic by Device" slot in the reference translated to shipping
// domain: carrier-level on-time performance, one coloured bar per carrier.
// Colours are kept high-contrast but varied so the chart reads well even
// though all bars represent the same metric.
export default function CarrierPerformanceChart() {
  const { t } = useTranslation();

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl bg-black/[0.03] p-5">
      <h3 className="text-sm font-semibold text-black">
        {t("pages.reports.carrierPerformance.title")}
      </h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={CARRIER_PERFORMANCE}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(0,0,0,0.45)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              width={36}
              tickFormatter={(n: number) => `${n}`}
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
              formatter={(value) => {
                const n = typeof value === "number" ? value : 0;
                return [
                  `${n}%`,
                  t("pages.reports.carrierPerformance.onTime"),
                ];
              }}
            />
            <Bar dataKey="onTimePercent" radius={[8, 8, 0, 0]} maxBarSize={32}>
              {CARRIER_PERFORMANCE.map((row) => (
                <Cell key={row.id} fill={row.tint} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
