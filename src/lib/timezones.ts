// IANA timezone picker helpers. Built on `Intl.supportedValuesOf('timeZone')`
// (Chrome 99+ / FF 93+ / Safari 15.4+, all our target browsers) with a
// static fallback when unavailable.
//
// Offsets are computed at module load and cached. DST transitions can make a
// cached label drift by one hour twice a year; accepted as a picker UX
// trade-off. If we ever need perfect accuracy the cache can be invalidated
// every few hours.

export type TimezoneOption = {
  /** IANA id — value we persist, e.g. `Asia/Seoul`. */
  id: string;
  /** Friendly label for the picker, e.g. `(GMT+09:00) Asia/Seoul`. */
  label: string;
  /** Signed offset in minutes. Used only for sorting. */
  offsetMinutes: number;
};

// Broad-ish seed of zones when the browser doesn't expose
// supportedValuesOf. Covers major shipping hubs + hand-picked regionals.
const FALLBACK_TIMEZONES: readonly string[] = [
  "UTC",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Johannesburg",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function getOffsetMinutes(timeZone: string): number {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(now);
    const lookup = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? "0");
    const asIfUtc = Date.UTC(
      lookup("year"),
      lookup("month") - 1,
      lookup("day"),
      lookup("hour"),
      lookup("minute"),
      lookup("second"),
    );
    return Math.round((asIfUtc - now.getTime()) / 60000);
  } catch {
    return 0;
  }
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `GMT${sign}${hh}:${mm}`;
}

let cached: TimezoneOption[] | null = null;

export function getTimezoneOptions(): TimezoneOption[] {
  if (cached) return cached;
  const ids =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [...FALLBACK_TIMEZONES];
  const options = ids.map<TimezoneOption>((id) => {
    const offsetMinutes = getOffsetMinutes(id);
    return {
      id,
      offsetMinutes,
      label: `(${formatOffset(offsetMinutes)}) ${id}`,
    };
  });
  // Sort by offset, then by id alphabetically so options at the same offset
  // group predictably.
  options.sort((a, b) =>
    a.offsetMinutes === b.offsetMinutes
      ? a.id.localeCompare(b.id)
      : a.offsetMinutes - b.offsetMinutes,
  );
  cached = options;
  return options;
}

export function getTimezoneLabel(id: string): string {
  const opt = getTimezoneOptions().find((o) => o.id === id);
  return opt ? opt.label : id;
}

export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}
