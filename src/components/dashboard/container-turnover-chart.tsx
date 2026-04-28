// Container turnover (picked / returned / street_turned) — H-9 신규.
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useContainerTurnoverData } from "@/hooks/queries/use-analytics-data";

export default function ContainerTurnoverChart({ days = 30 }: { days?: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useContainerTurnoverData(days);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const points = data.points.map((p) => ({
    bucket: p.bucket.slice(5),
    picked: p.picked,
    returned: p.returned,
    streetTurned: p.streetTurned,
  }));

  return (
    <section className="rounded-md border bg-background p-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("dashboard.section.containerTurnover")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.section.containerTurnoverHint", { days })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {t("dashboard.containerTurnover.avgDwell")}
          </div>
          <div className="font-mono text-base font-semibold">
            {data.avgDwellDays.toFixed(1)} {t("common.daysShort")}
          </div>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          {t("common.noData")}
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="picked"
                fill="#3b82f6"
                name={t("dashboard.containerTurnover.picked")}
              />
              <Bar
                dataKey="returned"
                fill="#94a3b8"
                name={t("dashboard.containerTurnover.returned")}
              />
              <Bar
                dataKey="streetTurned"
                fill="#22c55e"
                name={t("dashboard.containerTurnover.streetTurned")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
