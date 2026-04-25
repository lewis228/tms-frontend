// RealtimeEvent → InAppNotification 변환.
//
// 도메인 이벤트 type 별로 사람이 읽을 수 있는 제목/본문/이동 경로 결정.
// 알 수 없는 type 은 null → store 에 push 안 함.
import type { InAppNotification, RealtimeEvent } from "@/types";

export function realtimeToNotification(
  evt: RealtimeEvent,
): InAppNotification | null {
  const payload = (evt.payload ?? {}) as Record<string, unknown>;
  const id = (() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  })();

  const ref = (key: string): string | null =>
    typeof payload[key] === "string" ? (payload[key] as string) : null;

  const deliveryOrderId = ref("deliveryOrderId");
  const settlementId = ref("settlementId");
  const status = ref("status");

  switch (evt.type) {
    case "do.created":
      return {
        id,
        type: evt.type,
        title: "새 D/O 가 생성되었습니다",
        description: deliveryOrderId ? `ID ${deliveryOrderId}` : null,
        link: deliveryOrderId
          ? `/app/delivery-orders?do=${deliveryOrderId}`
          : "/app/delivery-orders",
        read: false,
        occurredAt: evt.occurredAt,
      };
    case "do.status_changed":
      return {
        id,
        type: evt.type,
        title: "D/O 상태가 변경되었습니다",
        description: status ? `→ ${status}` : null,
        link: deliveryOrderId
          ? `/app/delivery-orders?do=${deliveryOrderId}`
          : "/app/delivery-orders",
        read: false,
        occurredAt: evt.occurredAt,
      };
    case "leg.created":
      return {
        id,
        type: evt.type,
        title: "새 Leg 이 생성되었습니다",
        description: deliveryOrderId ? `D/O ${deliveryOrderId}` : null,
        link: deliveryOrderId
          ? `/app/delivery-orders?do=${deliveryOrderId}`
          : "/app/dispatch",
        read: false,
        occurredAt: evt.occurredAt,
      };
    case "leg.status_changed":
      return {
        id,
        type: evt.type,
        title: "Leg 상태가 변경되었습니다",
        description: status ? `→ ${status}` : null,
        link: deliveryOrderId
          ? `/app/delivery-orders?do=${deliveryOrderId}`
          : "/app/dispatch",
        read: false,
        occurredAt: evt.occurredAt,
      };
    case "settlement.calculated":
      return {
        id,
        type: evt.type,
        title: "정산이 계산되었습니다",
        description: null,
        link: settlementId
          ? `/app/accounting?settlement=${settlementId}`
          : "/app/accounting",
        read: false,
        occurredAt: evt.occurredAt,
      };
    case "settlement.adjusted":
      return {
        id,
        type: evt.type,
        title: "정산이 조정되었습니다",
        description: null,
        link: settlementId
          ? `/app/accounting?settlement=${settlementId}`
          : "/app/accounting",
        read: false,
        occurredAt: evt.occurredAt,
      };
    case "settlement.approved":
      return {
        id,
        type: evt.type,
        title: "정산이 승인되었습니다",
        description: null,
        link: settlementId
          ? `/app/accounting?settlement=${settlementId}`
          : "/app/accounting",
        read: false,
        occurredAt: evt.occurredAt,
      };
    case "settlement.unapproved":
      return {
        id,
        type: evt.type,
        title: "정산 승인이 취소되었습니다",
        description: null,
        link: settlementId
          ? `/app/accounting?settlement=${settlementId}`
          : "/app/accounting",
        read: false,
        occurredAt: evt.occurredAt,
      };
    case "file.uploaded":
      return null; // 알림 표시 대상 아님 (조용히 캐시 무효화만)
    default:
      return null;
  }
}
