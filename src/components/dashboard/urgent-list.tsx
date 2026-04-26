// 임박 D/O 표:
// 행 클릭 → /app/delivery-orders?do=:id navigate.
// pickUrgent / UrgentRow 는 ./urgent 로 분리.
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import StatusBadge from "@/components/delivery-order/status-badge";
import { formatDate } from "@/lib/format";
import type { UrgentRow } from "@/components/dashboard/urgent";
import type { CustomerEntity } from "@/types";

export default function UrgentList({
  rows,
  customers,
}: {
  rows: UrgentRow[];
  customers: CustomerEntity[];
}) {
  const { t } = useTranslation();
  const customerName = (id: number) =>
    customers.find((c) => c.id === id)?.name ?? "—";

  if (rows.length === 0) {
    return (
      <div className="rounded-md border bg-background p-6 text-center text-sm text-muted-foreground">
        {t("dashboard.urgent.noUrgent")}
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <div className="border-b bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("dashboard.urgent.header", { count: rows.length })}
      </div>
      <div className="divide-y">
        {rows.map((row) => (
          <Link
            key={`${row.do.id}-${row.type}`}
            to={`/app/delivery-orders?do=${row.do.id}`}
            className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent/40"
          >
            <StatusBadge status={row.do.status} />
            <span className="font-mono text-xs">
              {row.do.containerNumber ?? t("dispatch.containerUnset")}
            </span>
            <span className="text-muted-foreground">
              {customerName(row.do.customerId)}
            </span>
            <span className="ml-auto flex flex-col items-end text-xs">
              <span
                className={
                  row.daysLeft < 0
                    ? "font-medium text-red-600"
                    : row.daysLeft === 0
                      ? "font-medium text-red-500"
                      : row.daysLeft <= 1
                        ? "font-medium text-amber-600"
                        : "font-medium text-amber-500"
                }
              >
                {row.daysLeft < 0
                  ? t("dashboard.urgent.daysOver", {
                      count: Math.abs(row.daysLeft),
                    })
                  : row.daysLeft === 0
                    ? t("dashboard.urgent.daysToday")
                    : t("dashboard.urgent.daysLeft", { count: row.daysLeft })}
              </span>
              <span className="text-muted-foreground">
                {row.type === "demurrage"
                  ? t("dashboard.urgent.demurrage")
                  : t("dashboard.urgent.detention")}{" "}
                {formatDate(row.date)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
