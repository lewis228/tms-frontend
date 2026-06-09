// 장비 / DQ 만료 알림 카드 — 만료/임박 compliance 항목 리스트.
import { useTranslation } from "react-i18next";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useExpiringComplianceData } from "@/hooks/queries/use-expiring-compliance-data";
import { formatDate } from "@/lib/format";
import type { ExpiringItem } from "@/types";

const MAX_VISIBLE = 8;

export default function ExpiringComplianceCard({ days = 30 }: { days?: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useExpiringComplianceData(days);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const visible = data.items.slice(0, MAX_VISIBLE);
  const overflow = data.items.length - visible.length;

  return (
    <section className="rounded-md border bg-background p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("dashboard.section.expiringCompliance")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.section.expiringComplianceHint", { days })}
          </p>
        </div>
        <div className="flex gap-1">
          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            {t("dashboard.expiringCompliance.expired", {
              count: data.expiredCount,
            })}
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
            {t("dashboard.expiringCompliance.soon", { count: data.soonCount })}
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-sm text-muted-foreground">{t("common.noData")}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((item) => (
            <Row key={`${item.entityType}-${item.entityId}-${item.field}`} item={item} />
          ))}
          {overflow > 0 && (
            <p className="pt-1 text-xs text-muted-foreground">
              {t("dashboard.expiringCompliance.more", { count: overflow })}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Row({ item }: { item: ExpiringItem }) {
  const { t } = useTranslation();
  const expired = item.daysLeft < 0;
  const chipCls = expired
    ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-800";
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{item.label}</span>
        <span className="text-muted-foreground">
          {t(`dashboard.expiringCompliance.entityType.${item.entityType}`)} ·{" "}
          {t(`dashboard.expiringCompliance.field.${item.field}`)} ·{" "}
          {formatDate(item.expiresAt)}
        </span>
      </div>
      <span
        className={`shrink-0 rounded px-1.5 py-0.5 font-mono ${chipCls}`}
      >
        {expired
          ? t("dashboard.expiringCompliance.expiredChip")
          : t("dashboard.expiringCompliance.daysLeft", { count: item.daysLeft })}
      </span>
    </div>
  );
}
