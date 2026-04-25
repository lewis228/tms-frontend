import { useTranslation } from "react-i18next";
import {
  EXCEPTION_EVENTS,
  EXCEPTION_KIND_COLORS,
  type ExceptionKind,
} from "@/components/reports/mock-reports";

const KIND_ORDER: ExceptionKind[] = ["delayed", "etaChanged", "alert", "rollover"];

const KIND_LABEL_KEYS: Record<ExceptionKind, string> = {
  delayed: "pages.reports.exceptions.kind.delayed",
  etaChanged: "pages.reports.exceptions.kind.etaChanged",
  alert: "pages.reports.exceptions.kind.alert",
  rollover: "pages.reports.exceptions.kind.rollover",
};

// Horizontal 30-day timeline of exception events. Each kind occupies its
// own lane so types don't visually collide; dots sit on top of a
// hair-line rail representing time. Days ago is mapped onto the X axis
// (0 → right-most, 29 → left-most) so "now" is on the right — matches
// how users read recency (latest closest to them).
export default function ExceptionTimeline() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-black/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-black">
          {t("pages.reports.exceptions.title")}
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-black/55">
          {KIND_ORDER.map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: EXCEPTION_KIND_COLORS[k] }}
              />
              {t(KIND_LABEL_KEYS[k])}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {KIND_ORDER.map((kind) => {
          const color = EXCEPTION_KIND_COLORS[kind];
          const events = EXCEPTION_EVENTS.filter((e) => e.kind === kind);
          return (
            <div
              key={kind}
              className="flex items-center gap-3 text-[11px] text-black/55"
            >
              <span
                className="w-[88px] shrink-0 truncate"
                style={{ color }}
              >
                {t(KIND_LABEL_KEYS[kind])}
              </span>
              <div className="relative h-5 flex-1">
                {/* Rail */}
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
                {/* Dots — X% = (29 - daysAgo) / 29 so "now" sits right */}
                {events.map((evt) => {
                  const x = ((29 - evt.daysAgo) / 29) * 100;
                  return (
                    <span
                      key={evt.id}
                      className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%` }}
                    >
                      <span
                        className="block h-2.5 w-2.5 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: color }}
                      />
                      <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-black/10 bg-white px-2 py-1 text-[10px] text-black opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                        <span className="font-medium">{evt.mbl}</span>
                        <span className="text-black/55"> · {t(evt.labelKey)}</span>
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis labels: today right, 30d ago left */}
      <div className="ml-[100px] flex justify-between text-[10px] text-black/45">
        <span>{t("pages.reports.exceptions.axis.30dAgo")}</span>
        <span>{t("pages.reports.exceptions.axis.today")}</span>
      </div>
    </section>
  );
}
