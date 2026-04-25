import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/locales/en.json";
import ko from "@/i18n/locales/ko.json";
import {
  getLanguagePreference,
  resolveLanguage,
  subscribeLanguagePreference,
} from "@/store/language";

// i18next initialisation. Called once at app bootstrap (`main.tsx`).
//
// Language choice flows: language store (`preference`) → `resolveLanguage()`
// → i18n.changeLanguage. Phase 1 installs the plumbing with empty resource
// bundles; Phase 2 extracts strings into `locales/{ko,en}.json`.
//
// `en` is the hard fallback so any key missing from `ko.json` shows the
// English copy instead of the raw key (better UX while migration is partial).

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: resolveLanguage(getLanguagePreference()),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
  returnNull: false,
});

// Bridge the language store to i18next. Because the store is Zustand (not
// React context), this subscription runs once at module init and keeps
// i18next in sync without any Provider component. Every component reading
// `useTranslation()` re-renders automatically when `changeLanguage` fires.
subscribeLanguagePreference((preference) => {
  i18n.changeLanguage(resolveLanguage(preference));
});

export default i18n;
