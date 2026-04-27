import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";

// User-level UI language preference. Persisted to localStorage so the choice
// survives logout (this is an app-wide preference, not team-scoped).
//
// Resolution rule: `system` inspects `navigator.language`. Only `ko` and `en`
// ship as real translations right now, so anything the browser reports that
// isn't Korean falls back to English (the supported default).
//
// The resolved `ko` / `en` value is fed into i18next (`i18n.changeLanguage`).
// Components read translations through `useTranslation()` and never touch
// this store directly — they only subscribe to `useLanguagePreference()` if
// they need to render the picker itself.

export type LanguagePreference = "system" | "ko" | "en";
export type ResolvedLanguage = "ko" | "en";

type State = {
  preference: LanguagePreference;
};

const initialState: State = {
  preference: "system",
};

const useLanguageStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        actions: {
          setPreference: (preference: LanguagePreference) =>
            set({ preference }),
        },
      })),
      {
        name: "language-preference",
        partialize: (store) => ({ preference: store.preference }),
      },
    ),
    { name: "LanguageStore" },
  ),
);

export const useLanguagePreference = () =>
  useLanguageStore((s) => s.preference);

export const useSetLanguagePreference = () =>
  useLanguageStore((s) => s.actions.setPreference);

// Non-reactive getter for code that runs outside React (e.g. i18n init).
export const getLanguagePreference = (): LanguagePreference =>
  useLanguageStore.getState().preference;

// Non-reactive subscription for code outside React (i18n bridge). Fires only
// when `preference` actually changes, so i18n doesn't reload on unrelated
// store updates. Returns an unsubscribe function.
export const subscribeLanguagePreference = (
  listener: (preference: LanguagePreference) => void,
): (() => void) =>
  useLanguageStore.subscribe((state, prev) => {
    if (state.preference !== prev.preference) listener(state.preference);
  });

// Inspect the browser's preferred UI locale and map to a supported language.
// Anything not Korean resolves to English — including languages we don't
// translate yet (French, Japanese, ...) so the UI stays in a known state.
export function detectBrowserLanguage(): ResolvedLanguage {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("ko")) return "ko";
  return "en";
}

// Turn a user-facing preference into the language i18next should load.
export function resolveLanguage(
  preference: LanguagePreference,
): ResolvedLanguage {
  if (preference === "ko") return "ko";
  if (preference === "en") return "en";
  return detectBrowserLanguage();
}
