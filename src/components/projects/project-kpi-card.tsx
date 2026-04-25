import { AlertTriangle, Clock, Ship, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectKpi } from "@/components/projects/mock-projects";

// Mapping kept local so the mock data can stay serializable (no direct
// component references). Matches NavIconName pattern used in sidebar.tsx.
const ICONS: Record<ProjectKpi["iconName"], LucideIcon> = {
  AlertTriangle,
  Clock,
  Ship,
};

export default function ProjectKpiCard({ kpi }: { kpi: ProjectKpi }) {
  const { t } = useTranslation();
  const Icon = ICONS[kpi.iconName];
  const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-2xl p-5",
        kpi.tint,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-black/70">{t(kpi.labelKey)}</span>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            kpi.iconBadgeTint,
          )}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: kpi.iconColor }} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-[32px] font-semibold leading-none text-black">
          {kpi.value.toLocaleString()}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            kpi.trend === "up" ? "text-emerald-700" : "text-rose-700",
          )}
        >
          {kpi.deltaPercent > 0 ? "+" : ""}
          {kpi.deltaPercent.toFixed(2)}%
          <TrendIcon className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
