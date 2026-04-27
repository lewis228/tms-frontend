import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";

// Tenant-scoped display preferences (kept under "team" naming internally so
// existing lib/format.ts callers continue to work; user-facing labels say
// "Tenant"). For the MVP these live in localStorage so the page can stabilise
// the UX before backend columns exist.
//
// UTC-first architecture: all dates flowing between frontend ↔ backend ↔ DB
// are UTC ISO strings. These prefs only affect *display*.

export type CurrencyCode = "KRW" | "USD" | "EUR" | "JPY" | "CNY";
export type DecimalPlaces = 0 | 1 | 2 | 3 | 4;
export type DateFormat = "YYYY-MM-DD" | "MM/DD/YYYY" | "DD-MMM-YYYY";
export type TimeFormat = "24h" | "12h";
export type UnitSystem = "metric" | "imperial";

type State = {
  timezone: string;
  currency: CurrencyCode;
  decimalPlaces: DecimalPlaces;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  unitSystem: UnitSystem;
};

function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

const initialState: State = {
  timezone: detectBrowserTimezone(),
  currency: "KRW",
  decimalPlaces: 2,
  dateFormat: "YYYY-MM-DD",
  timeFormat: "24h",
  unitSystem: "metric",
};

const useTeamPreferencesStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        actions: {
          setTimezone: (timezone: string) => set({ timezone }),
          setCurrency: (currency: CurrencyCode) => set({ currency }),
          setDecimalPlaces: (decimalPlaces: DecimalPlaces) =>
            set({ decimalPlaces }),
          setDateFormat: (dateFormat: DateFormat) => set({ dateFormat }),
          setTimeFormat: (timeFormat: TimeFormat) => set({ timeFormat }),
          setUnitSystem: (unitSystem: UnitSystem) => set({ unitSystem }),
          setAll: (partial: Partial<State>) => set({ ...partial }),
        },
      })),
      {
        name: "team-preferences",
        partialize: (store) => ({
          timezone: store.timezone,
          currency: store.currency,
          decimalPlaces: store.decimalPlaces,
          dateFormat: store.dateFormat,
          timeFormat: store.timeFormat,
          unitSystem: store.unitSystem,
        }),
      },
    ),
    { name: "TeamPreferencesStore" },
  ),
);

export const useTeamPreferences = () => {
  const store = useTeamPreferencesStore();
  return {
    timezone: store.timezone,
    currency: store.currency,
    decimalPlaces: store.decimalPlaces,
    dateFormat: store.dateFormat,
    timeFormat: store.timeFormat,
    unitSystem: store.unitSystem,
  };
};

export const useSetTeamPreferences = () =>
  useTeamPreferencesStore((s) => s.actions.setAll);

export const useSetTeamTimezone = () =>
  useTeamPreferencesStore((s) => s.actions.setTimezone);

export const useSetTeamCurrency = () =>
  useTeamPreferencesStore((s) => s.actions.setCurrency);

export const useSetTeamDecimalPlaces = () =>
  useTeamPreferencesStore((s) => s.actions.setDecimalPlaces);

export const useSetTeamDateFormat = () =>
  useTeamPreferencesStore((s) => s.actions.setDateFormat);

export const useSetTeamTimeFormat = () =>
  useTeamPreferencesStore((s) => s.actions.setTimeFormat);

export const useSetTeamUnitSystem = () =>
  useTeamPreferencesStore((s) => s.actions.setUnitSystem);

// Non-reactive getter for utilities that run outside React (e.g. format.ts).
export const getTeamPreferences = (): State =>
  useTeamPreferencesStore.getState();
