// NotificationEntity → 클릭 시 이동 경로.
//
// 백엔드가 title/body 를 결정하므로 프론트는 link 만 맡는다.
// 알 수 없는 eventType 은 null (클릭 불가).
import type { NotificationEntity } from "@/types";

export function notificationLinkFor(n: NotificationEntity): string | null {
  const p = n.payload ?? {};
  // payload 값은 백엔드 직렬화에 따라 number (entity FK) 또는 string 모두 가능.
  const ref = (k: string): string | number | null => {
    const v = p[k];
    return typeof v === "string" || typeof v === "number" ? v : null;
  };

  const deliveryOrderId = ref("deliveryOrderId");
  const settlementId = ref("settlementId");

  if (n.eventType.startsWith("settlement.")) {
    return settlementId != null
      ? `/app/accounting?settlement=${settlementId}`
      : "/app/accounting";
  }
  if (n.eventType.startsWith("do.") || n.eventType.startsWith("leg.")) {
    return deliveryOrderId != null
      ? `/app/delivery-orders?do=${deliveryOrderId}`
      : null;
  }
  return null;
}
