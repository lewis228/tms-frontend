import { useTranslation } from "react-i18next";
import { TOP_CARRIERS } from "@/components/reports/mock-reports";

// Equivalent of the reference "Traffic by Website" list: a vertical stack
// of carriers ordered by share, each rendered as name + horizontal bar +
// percent. Height scales with row count so the card sits flush next to
// the main chart without a scrollbar for 6 entries.
export default function TopCarriersCard() {
  const { t } = useTranslation();

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl bg-black/[0.03] p-5">
      <h3 className="text-sm font-semibold text-black">
        {t("pages.reports.topCarriers.title")}
      </h3>
      <ul className="flex flex-col gap-4">
        {TOP_CARRIERS.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="w-24 shrink-0 truncate text-black/80">
              {row.name}
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-black"
                style={{ width: `${row.percent}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right tabular-nums text-black/55">
              {row.percent}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
