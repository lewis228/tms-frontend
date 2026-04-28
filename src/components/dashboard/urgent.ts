// 임박 D/O 선별 — H-1: LFD 가 컨테이너로 이동했으므로 container 단위로 검사.
//
// urgent-list.tsx 에서 분리 (react-refresh/only-export-components 룰 — 컴포넌트 파일은 컴포넌트만).
import type { ContainerEntity, DeliveryOrderEntity } from "@/types";

const URGENT_DAYS = 3;

export type UrgentRow = {
  do: DeliveryOrderEntity;
  container: ContainerEntity;
  type: "demurrage" | "detention";
  daysLeft: number;
  date: string;
};

export function pickUrgent(
  orders: DeliveryOrderEntity[],
  containers: ContainerEntity[],
): UrgentRow[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const out: UrgentRow[] = [];

  for (const c of containers) {
    const order = orderById.get(c.deliveryOrderId);
    if (!order) continue;
    if (order.status === "COMPLETED") continue;
    for (const [field, type] of [
      ["demurrageLfd", "demurrage" as const],
      ["detentionLfd", "detention" as const],
    ] as const) {
      const iso = c[field];
      if (!iso) continue;
      const lfd = new Date(iso).getTime();
      const days = Math.floor((lfd - todayMs) / 86400000);
      if (days <= URGENT_DAYS) {
        out.push({ do: order, container: c, type, daysLeft: days, date: iso });
      }
    }
  }
  out.sort((a, b) => a.daysLeft - b.daysLeft);
  return out;
}
