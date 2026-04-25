// 임박 D/O 선별 — demurrage_lfd / detention_lfd 가 오늘로부터 3일 이내, status != COMPLETED.
// urgent-list.tsx 에서 분리 (react-refresh/only-export-components 룰 — 컴포넌트 파일은 컴포넌트만).
import type { DeliveryOrderEntity } from "@/types";

const URGENT_DAYS = 3;

export type UrgentRow = {
  do: DeliveryOrderEntity;
  type: "demurrage" | "detention";
  daysLeft: number;
  date: string;
};

export function pickUrgent(orders: DeliveryOrderEntity[]): UrgentRow[] {
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
