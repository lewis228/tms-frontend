// Street turn 절감액 카드 — H-9 신규.
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useStreetTurnSavingsData } from "@/hooks/queries/use-analytics-data";
import { formatAmount } from "@/lib/format";

export default function StreetTurnSavingsCard({ days = 30 }: { days?: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useStreetTurnSavingsData(days);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <Link
      to="../street-turns"
      className="block rounded-md border bg-background p-4 transition hover:bg-muted/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("dashboard.section.streetTurnSavings")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.section.streetTurnSavingsHint", { days })}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
          {data.approvedCount}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold text-emerald-700">
          {formatAmount(Number(data.savingsAmount))}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("dashboard.streetTurnSavings.perTurn", {
            amount: formatAmount(Number(data.savingPerTurn)),
          })}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <Stat
          label={t("dashboard.streetTurnSavings.approved")}
          value={data.approvedCount}
          tone="positive"
        />
        <Stat
          label={t("dashboard.streetTurnSavings.requested")}
          value={data.requestedCount}
        />
        <Stat
          label={t("dashboard.streetTurnSavings.rejected")}
          value={data.rejectedCount}
          tone="negative"
        />
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex flex-col rounded bg-muted/50 px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          "font-mono font-semibold " +
          (tone === "positive"
            ? "text-emerald-700"
            : tone === "negative"
              ? "text-red-700"
              : "")
        }
      >
        {value}
      </span>
    </div>
  );
}
