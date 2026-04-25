import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Calendar, TrendingUp } from "lucide-react";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { useTeamUsageData } from "@/hooks/queries/use-team-usage-data";
import { cn } from "@/lib/utils";

type WindowChoice = 7 | 30 | 90;

const WINDOW_OPTIONS: readonly {
  value: WindowChoice;
  labelKey: string;
}[] = [
  { value: 7, labelKey: "pages.developer.usage.window7" },
  { value: 30, labelKey: "pages.developer.usage.window30" },
  { value: 90, labelKey: "pages.developer.usage.window90" },
];

const PLAN_CLASS: Record<string, string> = {
  free: "bg-black/[0.04] text-black/70",
  basic: "bg-blue-50 text-blue-700",
  pro: "bg-purple-50 text-purple-700",
};

export default function DeveloperUsagePage() {
  const params = useParams();
  const teamId = params.teamId ? Number(params.teamId) : undefined;
  const [days, setDays] = useState<WindowChoice>(30);
  const { t } = useTranslation();

  const { data, error, isPending } = useTeamUsageData({ teamId, days });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;
  if (!data) return <Fallback />;

  return (
    <div className="flex flex-col gap-7 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("pages.developer.usage.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("pages.developer.usage.description")}
        </p>
      </div>

      <KpiRow data={data} />

      <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-black/60" />
            <h2 className="text-sm font-semibold text-black">
              {t("pages.developer.usage.dailyTitle")}
            </h2>
          </div>
          <WindowPicker current={days} onChange={setDays} />
        </div>

        <UsageChart data={data} />
      </section>

      <PlanUsageCard data={data} />
    </div>
  );
}

function KpiRow({
  data,
}: {
  data: {
    today_count: number;
    total_count: number;
    daily_limit: number;
    plan: string;
  };
}) {
  const { t } = useTranslation();
  const todayRemaining = Math.max(0, data.daily_limit - data.today_count);
  const utilization = Math.min(
    100,
    Math.round((data.today_count / Math.max(1, data.daily_limit)) * 100),
  );
  const planClass = PLAN_CLASS[data.plan] ?? "bg-black/[0.04] text-black/70";
  // Map known plan codes to a capitalised label; unknowns display raw.
  const planLabel =
    data.plan === "free"
      ? "Free"
      : data.plan === "basic"
        ? "Basic"
        : data.plan === "pro"
          ? "Pro"
          : data.plan;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <KpiCard
        icon={<Calendar className="h-4 w-4" />}
        label={t("pages.developer.usage.today")}
        value={data.today_count.toLocaleString()}
        hint={t("pages.developer.usage.todayRemaining", {
          remaining: todayRemaining.toLocaleString(),
          pct: utilization,
        })}
        tone={utilization >= 80 ? "red" : utilization >= 50 ? "amber" : "blue"}
      />
      <KpiCard
        icon={<TrendingUp className="h-4 w-4" />}
        label={t("pages.developer.usage.total")}
        value={data.total_count.toLocaleString()}
        hint={t("pages.developer.usage.totalHint")}
        tone="neutral"
      />
      <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-black/55">
            {t("pages.developer.usage.currentPlan")}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
              planClass,
            )}
          >
            {planLabel}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-black">
            {data.daily_limit.toLocaleString()}
          </span>
          <span className="text-xs text-black/55">
            {t("pages.developer.usage.dailyLimit")}
          </span>
        </div>
      </div>
    </div>
  );
}

function WindowPicker({
  current,
  onChange,
}: {
  current: WindowChoice;
  onChange: (next: WindowChoice) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-white p-0.5">
      {WINDOW_OPTIONS.map((opt) => {
        const isActive = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs transition-colors",
              isActive
                ? "bg-black text-white"
                : "text-black/60 hover:bg-black/[0.04] hover:text-black",
            )}
          >
            {t(opt.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

function UsageChart({
  data,
}: {
  data: { daily: { date: string; count: number }[] };
}) {
  const { t } = useTranslation();
  const rows = useMemo(
    () =>
      data.daily.map((p) => ({
        ...p,
        label: formatShortDate(p.date),
      })),
    [data.daily],
  );

  const isAllZero = rows.every((r) => r.count === 0);
  if (isAllZero) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/10 bg-black/[0.02] text-center">
        <span className="text-sm font-medium text-black">
          {t("pages.developer.usage.emptyTitle")}
        </span>
        <span className="text-xs text-black/55">
          {t("pages.developer.usage.emptyHint")}
        </span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          <RechartTooltip
            cursor={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              fontSize: 12,
            }}
            labelStyle={{ color: "rgba(0,0,0,0.6)" }}
            formatter={(value) => {
              const n = typeof value === "number" ? value : 0;
              return [
                t("pages.developer.usage.calls", { count: n.toLocaleString() }),
                "",
              ];
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#000"
            strokeWidth={2}
            fill="url(#usageGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function PlanUsageCard({
  data,
}: {
  data: { today_count: number; daily_limit: number };
}) {
  const { t } = useTranslation();
  const utilization = Math.min(
    100,
    Math.round((data.today_count / Math.max(1, data.daily_limit)) * 100),
  );
  const barColor =
    utilization >= 80
      ? "bg-red-500"
      : utilization >= 50
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-black">
          {t("pages.developer.usage.todayUsage")}
        </h2>
        <span className="text-xs text-black/55">
          {data.today_count.toLocaleString()} /{" "}
          {data.daily_limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={cn("h-full transition-all", barColor)}
          style={{ width: `${utilization}%` }}
        />
      </div>
      <p className="text-xs text-black/50">
        {t("pages.developer.usage.resetHint")}
      </p>
    </section>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone: "neutral" | "blue" | "amber" | "red";
}) {
  const toneClass: Record<string, string> = {
    neutral: "bg-black/[0.04] text-black",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-black/55">{label}</span>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            toneClass[tone],
          )}
        >
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-black">{value}</span>
      </div>
      {hint && <span className="text-xs text-black/55">{hint}</span>}
    </div>
  );
}

function formatShortDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return `${month}/${day}`;
}
