// 임박 D/O 표:
// 행 클릭 → /app/delivery-orders?do=:id navigate.
// pickUrgent / UrgentRow 는 ./urgent 로 분리.
import { Link } from "react-router-dom";

import StatusBadge from "@/components/delivery-order/status-badge";
import type { UrgentRow } from "@/components/dashboard/urgent";
import type { CustomerEntity } from "@/types";

export default function UrgentList({
  rows,
  customers,
}: {
  rows: UrgentRow[];
  customers: CustomerEntity[];
}) {
  const customerName = (id: number) =>
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
