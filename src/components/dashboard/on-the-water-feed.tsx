import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Anchor, MessageSquare, Ship, Square, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WATER_EVENTS, WEEK_LABELS } from "@/components/dashboard/mock-dashboard";
import type { WaterEvent } from "@/components/dashboard/mock-dashboard";

const KIND_ICON: Record<WaterEvent["kind"], LucideIcon> = {
  arrival: Anchor,
  departure: Ship,
  stop: Square,
  registered: UserPlus,
  note: MessageSquare,
};

const KIND_TONE: Record<WaterEvent["kind"], string> = {
  arrival: "bg-emerald-50 text-emerald-700",
  departure: "bg-sky-50 text-sky-700",
  stop: "bg-rose-50 text-rose-700",
  registered: "bg-violet-50 text-violet-700",
  note: "bg-amber-50 text-amber-700",
};

// Extracted so TypeScript can narrow `event` via a switch. Inline
// `event.kind === "a" || event.kind === "b"` chains didn't narrow the
// discriminated union reliably in the else branch, leaving `event.mbl` /
// `event.location` / `event.text` untyped at the access site.
function renderEventLabel(
  event: WaterEvent,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  switch (event.kind) {
    case "arrival":
    case "departure":
    case "stop":
      return t(`pages.dashboard.water.kind.${event.kind}`, {
        mbl: event.mbl,
        location: event.location,
      });
    case "registered":
    case "note":
      return event.text;
  }
}

// Left column of the dashboard middle row. Header + week strip + live
// activity feed. Mirrors the reference "What's on the road?" card but
// renders ocean-tracking events (arrivals, departures, stops) and user
// actions (tracking registered, notes). Events are mock for now.
export default function OnTheWaterFeed() {
  const { t } = useTranslation();

  // Compute this week's numeric dates (Mon → Sun) so the strip always
  // reflects the current week. `todayIdx` highlights the current day.
  const week = useMemo(() => {
    const now = new Date();
    // getDay(): Sun=0..Sat=6. Shift so Mon=0..Sun=6.
    const dayIndex = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayIndex);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { label: WEEK_LABELS[i], day: d.getDate(), isToday: i === dayIndex };
    });
  }, []);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-black/10 bg-white p-5">
      <header>
        <h3 className="text-sm font-semibold text-black">
          {t("pages.dashboard.water.title")}
        </h3>
      </header>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1">
        {week.map(({ label, day, isToday }) => (
          <div
            key={label + day}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-center",
              isToday && "bg-black text-white",
            )}
          >
            <span
              className={cn(
                "text-[11px]",
                isToday ? "text-white/70" : "text-black/55",
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                "text-base font-semibold",
                isToday ? "text-white" : "text-black",
              )}
            >
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Event feed */}
      <ul className="flex flex-col gap-3">
        {WATER_EVENTS.map((event) => {
          const Icon = KIND_ICON[event.kind];
          const tone = KIND_TONE[event.kind];
          return (
            <li key={event.id} className="flex items-start gap-3">
              {event.kind === "registered" || event.kind === "note" ? (
                <img
                  src={event.actorAvatar}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    tone,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm text-black">
                  {renderEventLabel(event, t)}
                </span>
                <span className="text-xs text-black/55">{event.timeAgo}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
