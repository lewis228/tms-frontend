import i18n from "i18next";

export function formatTimeAgo(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return i18n.t("time.justNow");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return i18n.t("time.minutesAgo", { count: diffMin });
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return i18n.t("time.hoursAgo", { count: diffHour });
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return i18n.t("time.daysAgo", { count: diffDay });
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return i18n.t("time.weeksAgo", { count: diffWeek });
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return i18n.t("time.monthsAgo", { count: diffMonth });
  const diffYear = Math.floor(diffDay / 365);
  return i18n.t("time.yearsAgo", { count: diffYear });
}
