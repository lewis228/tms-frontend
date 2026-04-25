// NotificationEntity → 클릭 시 이동 경로.
//
// 백엔드가 title/body 를 결정하므로 프론트는 link 만 맡는다.
// 알 수 없는 eventType 은 null (클릭 불가).
import type { NotificationEntity } from "@/types";

export function notificationLinkFor(n: NotificationEntity): string | null {
  const p = n.payload ?? {};
  const ref = (k: string): string | null =>
    typeof p[k] === "string" ? (p[k] as string) : null;

  const deliveryOrderId = ref("deliveryOrderId");
  const settlementId = ref("settlementId");

  if (n.eventType.startsWith("settlement.")) {
    return settlementId
      ? `/app/accounting?settlement=${settlementId}`
      : "/app/accounting";
  }
  if (n.eventType.startsWith("do.") || n.eventType.startsWith("leg.")) {
    return deliveryOrderId
      ? `/app/delivery-orders?do=${deliveryOrderId}`
      : null;
  }
  return null;
}
