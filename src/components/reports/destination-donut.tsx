import { useTranslation } from "react-i18next";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
} from "recharts";
import { DESTINATION_SHARES } from "@/components/reports/mock-reports";

// "Traffic by Location" slot translated to destination region distribution.
// Donut on the left, coloured legend + percentages on the right — matches
// the reference layout tile for tile. Keeps each slice's colour in sync
// with the legend dot so users can scan either side.
export default function DestinationDonut() {
  const { t } = useTranslation();

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl bg-black/[0.03] p-5">
      <h3 className="text-sm font-semibold text-black">
        {t("pages.reports.destinationShares.title")}
      </h3>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DESTINATION_SHARES}
                dataKey="percent"
                nameKey="labelKey"
                innerRadius="60%"
                outerRadius="95%"
                stroke="transparent"
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                isAnimationActive={false}
              >
                {DESTINATION_SHARES.map((r) => (
                  <Cell key={r.id} fill={r.color} />
                ))}
              </Pie>
              <RechartTooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.08)",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                labelStyle={{ color: "rgba(0,0,0,0.6)" }}
                formatter={(value, _name, props) => {
                  const n = typeof value === "number" ? value : 0;
                  const payload = props as { payload?: { labelKey: string } };
                  const key = payload.payload?.labelKey ?? "";
                  return [`${n.toFixed(1)}%`, key ? t(key) : ""];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex flex-col gap-2.5 text-xs">
          {DESTINATION_SHARES.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2 text-black/80">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
                {t(r.labelKey)}
              </span>
              <span className="tabular-nums text-black/55">
                {r.percent.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
