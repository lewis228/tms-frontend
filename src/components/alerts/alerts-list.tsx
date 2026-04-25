import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Anchor,
  CircleDollarSign,
  Clock,
  RefreshCw,
  Ship,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MOCK_ALERTS,
  type AlertItem,
  type AlertKind,
  type AlertSeverity,
} from "@/components/alerts/mock-alerts";

const KIND_ICON: Record<AlertKind, LucideIcon> = {
  demurrage: CircleDollarSign,
  "per-diem": Clock,
  delay: AlertTriangle,
  "scrape-failed": RefreshCw,
  arrival: Anchor,
  "carrier-change": Ship,
};

const SEVERITY_STYLE: Record<
  AlertSeverity,
  { dot: string; badge: string; iconBg: string; iconColor: string }
> = {
  critical: {
    dot: "bg-rose-500",
    badge: "text-rose-700 bg-rose-50",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  warning: {
    dot: "bg-amber-500",
    badge: "text-amber-700 bg-amber-50",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  info: {
    dot: "bg-sky-500",
    badge: "text-sky-700 bg-sky-50",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
};

const FILTERS: ReadonlyArray<"all" | AlertSeverity> = [
  "all",
  "critical",
  "warning",
  "info",
];

export default function AlertsList() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | AlertSeverity>("all");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_ALERTS.filter((a) => {
      if (filter !== "all" && a.severity !== filter) return false;
      if (showOnlyUnread && a.isRead) return false;
      return true;
    });
  }, [filter, showOnlyUnread]);

  const unreadCount = MOCK_ALERTS.filter((a) => !a.isRead).length;
  const countsBySeverity = useMemo(() => {
    return {
      critical: MOCK_ALERTS.filter(
        (a) => a.severity === "critical" && !a.isRead,
      ).length,
      warning: MOCK_ALERTS.filter(
        (a) => a.severity === "warning" && !a.isRead,
      ).length,
      info: MOCK_ALERTS.filter((a) => a.severity === "info" && !a.isRead)
        .length,
    };
  }, []);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryTile
          tone="critical"
          label={t("pages.alerts.summary.critical")}
          count={countsBySeverity.critical}
        />
        <SummaryTile
          tone="warning"
          label={t("pages.alerts.summary.warning")}
          count={countsBySeverity.warning}
        />
        <SummaryTile
          tone="info"
          label={t("pages.alerts.summary.info")}
          count={countsBySeverity.info}
        />
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => {
            const isActive = f === filter;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "bg-black/[0.04] text-black/70 hover:bg-black/[0.08] hover:text-black",
                )}
              >
                {t(`pages.alerts.filter.${f}`)}
              </button>
            );
          })}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-black/70">
          <input
            type="checkbox"
            checked={showOnlyUnread}
            onChange={(e) => setShowOnlyUnread(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer rounded border-black/30"
          />
          {t("pages.alerts.showUnread", { count: unreadCount })}
        </label>
      </div>

      {/* Alert list */}
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {filtered.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
        {filtered.length === 0 && (
          <li className="flex flex-col items-center justify-center gap-2 py-12 text-center text-xs text-black/45">
            <AlertTriangle className="h-5 w-5 text-black/30" />
            {t("pages.alerts.empty")}
          </li>
        )}
      </ul>
    </section>
  );
}

function SummaryTile({
  tone,
  label,
  count,
}: {
  tone: AlertSeverity;
  label: string;
  count: number;
}) {
  const style = SEVERITY_STYLE[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/10 p-4">
      <span className={cn("h-2 w-2 rounded-full", style.dot)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs text-black/55">{label}</span>
        <span className="text-2xl font-semibold leading-none tabular-nums text-black">
          {count}
        </span>
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const { t } = useTranslation();
  const Icon = KIND_ICON[alert.kind];
  const style = SEVERITY_STYLE[alert.severity];
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border border-black/[0.06] p-3 transition-colors hover:bg-black/[0.02]",
        !alert.isRead && "bg-black/[0.01]",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          style.iconBg,
        )}
      >
        <Icon className={cn("h-4 w-4", style.iconColor)} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black">
            {alert.subject}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              style.badge,
            )}
          >
            {t(`pages.alerts.kind.${alert.kind}`)}
          </span>
          {!alert.isRead && (
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
          )}
        </div>
        <p className="text-xs text-black/70">{alert.message}</p>
        <span className="text-[11px] text-black/45">{alert.timeAgo}</span>
      </div>
    </li>
  );
}
