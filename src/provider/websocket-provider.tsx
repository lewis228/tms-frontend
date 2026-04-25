// WebSocket 마운트 + 도메인 이벤트 → React Query 캐시 무효화.
//
// 백엔드 event types (publish wiring):
// - do.created / do.status_changed
// - leg.created / leg.status_changed
// - file.uploaded
// - settlement.calculated/adjusted/approved/unapproved
//
// 백엔드 fan_out_event 가 inbox row 를 자동 생성하므로 프론트는 알림 list/count
// 캐시 무효화만 처리. 다음 fetch 에서 새 알림이 보임.
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

      // 모든 inbox 대상 이벤트 → 알림 캐시 무효화 (서버 fan-out 후 다음 fetch 에서 보임).
      const inboxTypes = new Set([
        "do.created",
        "do.status_changed",
        "leg.created",
        "leg.status_changed",
        "settlement.calculated",
        "settlement.adjusted",
        "settlement.approved",
        "settlement.unapproved",
      ]);
      if (inboxTypes.has(evt.type)) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.notification.all });
      }

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
          qc.invalidateQueries({ queryKey: QUERY_KEYS.settlement.all });
          if (settlementId) {
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.settlement.byId(settlementId),
            });
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.settlement.extras(settlementId),
            });
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.settlement.auditLogs(settlementId),
            });
          }
          if (legId) {
            qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.byId(legId) });
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
