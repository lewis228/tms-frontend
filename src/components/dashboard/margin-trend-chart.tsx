// Margin trend (revenue / payouts / margin) — H-9 신규.
import { useTranslation } from "react-i18next";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useMarginTrendData } from "@/hooks/queries/use-analytics-data";
import { formatAmount } from "@/lib/format";

export default function MarginTrendChart({ days = 30 }: { days?: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useMarginTrendData(days);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const points = data.points.map((p) => ({
    bucket: p.bucket.slice(5), // MM-DD
    revenue: Number(p.revenue),
    payouts: Number(p.payouts),
    margin: Number(p.margin),
  }));

  return (
    <section className="rounded-md border bg-background p-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("dashboard.section.marginTrend")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.section.marginTrendHint", { days })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {t("dashboard.marginTrend.totalMargin")}
          </div>
          <div className="font-mono text-base font-semibold">
            {formatAmount(Number(data.totalMargin))}
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
            <ComposedChart data={points}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v) => formatAmount(Number(v ?? 0))}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                fill="#22c55e33"
                stroke="#22c55e"
                name={t("dashboard.marginTrend.revenue")}
              />
              <Area
                type="monotone"
                dataKey="payouts"
                fill="#ef444433"
                stroke="#ef4444"
                name={t("dashboard.marginTrend.payouts")}
              />
              <Line
                type="monotone"
                dataKey="margin"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name={t("dashboard.marginTrend.margin")}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
