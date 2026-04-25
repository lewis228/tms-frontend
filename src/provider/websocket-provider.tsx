// WebSocket 마운트 + 도메인 이벤트 → React Query 캐시 무효화.
//
// 백엔드 event types (publish wiring):
// - do.created / do.status_changed
// - leg.created / leg.status_changed
// - file.uploaded
// - settlement.calculated/adjusted/approved/unapproved
//
// 본 Provider 는 envelope 의 type 을 보고 해당 캐시 키를 invalidate. UI 토스트 알림은
// notifications 도메인에서 별도 처리 예정 (Phase 7+).
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants";
import { realtimeWs, type ServerEvent } from "@/lib/websocket";
import {
  useCurrentTenantId,
  useCurrentUser,
  useIsBootstrapped,
} from "@/store/auth";

export default function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const qc = useQueryClient();
  const isBootstrapped = useIsBootstrapped();
  const user = useCurrentUser();
  const tenantId = useCurrentTenantId();

  useEffect(() => {
    if (!isBootstrapped || !user || !tenantId) {
      realtimeWs.disconnect();
      return;
    }
    realtimeWs.connect(tenantId);

    const off = realtimeWs.addListener((evt: ServerEvent) => {
      const payload = (evt.payload ?? {}) as Record<string, unknown>;
      const deliveryOrderId =
        typeof payload.deliveryOrderId === "string"
          ? payload.deliveryOrderId
          : null;
      const legId =
        typeof payload.legId === "string" ? payload.legId : null;
      const driverId =
        typeof payload.driverId === "string" ? payload.driverId : null;
      const settlementId =
        typeof payload.settlementId === "string"
          ? payload.settlementId
          : null;

      switch (evt.type) {
        case "do.created":
        case "do.status_changed":
          qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
          if (deliveryOrderId) {
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.deliveryOrder.byId(deliveryOrderId),
            });
          }
          break;
        case "leg.created":
        case "leg.status_changed":
          qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
          if (deliveryOrderId) {
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.leg.byDeliveryOrder(deliveryOrderId),
            });
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.deliveryOrder.byId(deliveryOrderId),
            });
            qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryOrder.all });
          }
          if (driverId) {
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.leg.byDriver(driverId),
            });
          }
          if (legId) {
            qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.byId(legId) });
          }
          break;
        case "file.uploaded":
          // Phase 7+ files 도메인에서 처리.
          break;
        case "settlement.calculated":
        case "settlement.adjusted":
        case "settlement.approved":
        case "settlement.unapproved":
          // Settlement 도메인은 Phase 8 에서 query keys 추가 후 invalidate.
          // legId 가 있으면 leg 캐시도 갱신.
          if (legId) {
            qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.byId(legId) });
          }
          if (settlementId) {
            // future: invalidate settlement.byId(settlementId)
          }
          break;
        default:
          // 알 수 없는 type — 무시.
          break;
      }
    });

    return () => {
      off();
    };
  }, [isBootstrapped, user, tenantId, qc]);

  return <>{children}</>;
}
