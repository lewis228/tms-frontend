import { getTeamPreferences } from "@/store/team-preferences";

// Centralised formatters. Every amount/date/weight/volume displayed in the
// app should funnel through one of these so timezone, currency, decimal
// places, etc. stay consistent with the user's team preferences.
//
// **UTC-first rule.** All date inputs here must be UTC ISO strings (what the
// backend emits). These helpers are the *only* place we shift to the user's
// display timezone. Don't do ad-hoc `new Date(x).toLocaleString()` in
// components — it silently uses the browser's zone and diverges from other
// members of the same team.
//
// Reactivity: formatters read `getTeamPreferences()` on each call. Inside
// React components, also subscribe via `useTeamPreferences()` from the
// store so the component re-renders when prefs change.

const CURRENCY_SYMBOL: Record<string, string> = {
  KRW: "₩",
  USD: "$",
  EUR: "€",
  JPY: "¥",
  CNY: "¥",
};

// ── Amount ──────────────────────────────────────────────────────────

export function formatAmount(value: number): string {
  const { currency, decimalPlaces } = getTeamPreferences();
  const symbol = CURRENCY_SYMBOL[currency] ?? "";
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  return `${symbol}${formatted}`;
}

// ── Date / Time ────────────────────────────────────────────────────

function partsFor(isoOrDate: string | Date, timezone: string) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(d);
}

function pickPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((p) => p.type === type)?.value ?? "";
}

export function formatDate(iso: string | Date): string {
  const { timezone, dateFormat } = getTeamPreferences();
  const parts = partsFor(iso, timezone);
  const yyyy = pickPart(parts, "year");
  const mm = pickPart(parts, "month");
  const dd = pickPart(parts, "day");

  if (dateFormat === "YYYY-MM-DD") return `${yyyy}-${mm}-${dd}`;
  if (dateFormat === "MM/DD/YYYY") return `${mm}/${dd}/${yyyy}`;
  // DD-MMM-YYYY — need the short month name from a second formatter call.
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const monthShort = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
  }).format(d);
  return `${dd}-${monthShort}-${yyyy}`;
}

export function formatTime(iso: string | Date): string {
  const { timezone, timeFormat } = getTeamPreferences();
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  }).format(d);
}

export function formatDateTime(iso: string | Date): string {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}

// ── Weight / Volume ────────────────────────────────────────────────

export function formatWeight(kg: number): string {
  const { unitSystem } = getTeamPreferences();
  if (unitSystem === "metric") {
    return `${kg.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} kg`;
  }
  const lb = kg * 2.20462;
  return `${lb.toLocaleString(undefined, { maximumFractionDigits: 2 })} lb`;
}

export function formatVolume(cbm: number): string {
  const { unitSystem } = getTeamPreferences();
  if (unitSystem === "metric") {
    return `${cbm.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })} m³`;
  }
  const cft = cbm * 35.3147;
  return `${cft.toLocaleString(undefined, { maximumFractionDigits: 2 })} ft³`;
}
