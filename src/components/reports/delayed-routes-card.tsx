import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DELAYED_ROUTES } from "@/components/reports/mock-reports";

// Ranked list of lanes with the worst delay performance. Each row
// renders Origin → Destination, a horizontal delay-rate bar, and two
// supporting metrics (shipments · avg delay days). Kept as a card-list
// rather than a chart because the axis-of-interest (lane identity) is
// categorical string-heavy — bars/labels side-by-side scan faster than
// a traditional chart.
export default function DelayedRoutesCard() {
  const { t } = useTranslation();

  const maxRate = Math.max(...DELAYED_ROUTES.map((r) => r.delayRate), 1);

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl bg-black/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">
          {t("pages.reports.delayedRoutes.title")}
        </h3>
        <span className="text-[11px] text-black/55">
          {t("pages.reports.delayedRoutes.subtitle")}
        </span>
      </div>
      <ul className="flex flex-col gap-4">
        {DELAYED_ROUTES.map((route) => {
          const widthPct = (route.delayRate / maxRate) * 100;
          return (
            <li
              key={route.id}
              className="flex flex-col gap-1.5 border-b border-black/[0.06] pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-black">
                  <span className="truncate">{route.origin}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-black/40" />
                  <span className="truncate">{route.destination}</span>
                </span>
                <span className="text-sm font-semibold text-rose-700 tabular-nums">
                  {route.delayRate.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-rose-500/80"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-black/55">
                <span>
                  {t("pages.reports.delayedRoutes.shipments", {
                    count: route.shipments,
                  })}
                </span>
                <span>
                  {t("pages.reports.delayedRoutes.avgDelay", {
                    days: route.avgDelayDays.toFixed(1),
                  })}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
