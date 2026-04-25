// 임박 D/O 표:
// - demurrage_lfd 또는 detention_lfd 가 오늘로부터 3일 이내
// - status != COMPLETED
// 행 클릭 → /app/delivery-orders?do=:id navigate.
import { Link } from "react-router-dom";

import StatusBadge from "@/components/delivery-order/status-badge";
import type { CustomerEntity, DeliveryOrderEntity } from "@/types";

const URGENT_DAYS = 3;

export type UrgentRow = {
  do: DeliveryOrderEntity;
  type: "demurrage" | "detention";
  daysLeft: number;
  date: string;
};

export function pickUrgent(
  orders: DeliveryOrderEntity[],
): UrgentRow[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const out: UrgentRow[] = [];
  for (const d of orders) {
    if (d.status === "COMPLETED") continue;
    for (const [field, type] of [
      ["demurrageLfd", "demurrage" as const],
      ["detentionLfd", "detention" as const],
    ] as const) {
      const iso = d[field];
      if (!iso) continue;
      const lfd = new Date(iso).getTime();
      const days = Math.floor((lfd - todayMs) / 86400000);
      if (days <= URGENT_DAYS) {
        out.push({ do: d, type, daysLeft: days, date: iso });
      }
    }
  }
  out.sort((a, b) => a.daysLeft - b.daysLeft);
  return out;
}

export default function UrgentList({
  rows,
  customers,
}: {
  rows: UrgentRow[];
  customers: CustomerEntity[];
}) {
  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? "—";

  if (rows.length === 0) {
    return (
      <div className="rounded-md border bg-background p-6 text-center text-sm text-muted-foreground">
        임박 D/O 가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <div className="border-b bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        ⚠ 임박 D/O ({rows.length}) — demurrage / detention LFD 3일 이내
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
              {row.do.containerNumber ?? "(미지정)"}
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
                  ? `${Math.abs(row.daysLeft)}일 경과`
                  : row.daysLeft === 0
                    ? "오늘"
                    : `${row.daysLeft}일 남음`}
              </span>
              <span className="text-muted-foreground">
                {row.type === "demurrage" ? "Demurrage" : "Detention"}{" "}
                {new Date(row.date).toLocaleDateString("ko-KR")}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
