// WebSocket 마운트 + 도메인 이벤트 → React Query 캐시 무효화.
//
// 백엔드 event types (publish wiring):
// - do.created / do.status_changed
// - leg.created / leg.status_changed
// - file.uploaded
// - rate_group.* / rate_sheet.updated / rate_zone.* /
//   driver_rate_assignment.* / addon.* / service_area.updated (캐시 무효화만)
//
// 백엔드 fan_out_event 가 inbox row 를 자동 생성하므로 프론트는 알림 list/count
// 캐시 무효화만 처리. 다음 fetch 에서 새 알림이 보임.
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants";
import { realtimeWs, type ServerEvent } from "@/lib/websocket";
import {
  useCurrentTeamId,
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
  const teamId = useCurrentTeamId();

  useEffect(() => {
    if (!isBootstrapped || !user || !teamId) {
      realtimeWs.disconnect();
      return;
    }
    realtimeWs.connect(String(teamId));

    const off = realtimeWs.addListener((evt: ServerEvent) => {
      const payload = (evt.payload ?? {}) as Record<string, unknown>;
      // 백엔드 entity FK 는 number — payload 에선 직렬화에 따라 number/string 모두 가능.
      const idFrom = (k: string): number | null => {
        const v = payload[k];
        if (typeof v === "number") return v;
        if (typeof v === "string" && v !== "") {
          const n = Number(v);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      };
      const deliveryOrderId = idFrom("deliveryOrderId");
      const legId = idFrom("legId");
      const driverId = idFrom("driverId");

      // 모든 inbox 대상 이벤트 → 알림 캐시 무효화 (서버 fan-out 후 다음 fetch 에서 보임).
      const inboxTypes = new Set([
        "do.created",
        "do.status_changed",
        "leg.created",
        "leg.status_changed",
        // v3: 컨테이너 WAITING_PLAN 진입 시 디스패처 inbox 알림.
        "container.waiting_plan",
      ]);
      if (inboxTypes.has(evt.type)) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.notification.all });
      }

      // ── v3 Container-First 이벤트 invalidation ──
      const containerIdEvt = idFrom("containerId");
      if (
        evt.type.startsWith("container_stop.") ||
        evt.type === "container.state_changed"
      ) {
        if (containerIdEvt) {
          qc.invalidateQueries({
            queryKey: QUERY_KEYS.containerV3.stops(containerIdEvt),
          });
          qc.invalidateQueries({
            queryKey: QUERY_KEYS.containerV3.full(containerIdEvt),
          });
        }
        qc.invalidateQueries({ queryKey: QUERY_KEYS.containerV3.all });
      }
      if (evt.type.startsWith("leg_segment.")) {
        if (legId) {
          qc.invalidateQueries({
            queryKey: QUERY_KEYS.legSegment.byLeg(legId),
          });
        }
        qc.invalidateQueries({ queryKey: QUERY_KEYS.containerV3.all });
      }

      // ── Rate family 이벤트 invalidation (inbox 알림 아님 — 캐시만) ──
      // rate_group.created|updated|deleted / rate_sheet.updated → 그룹 + 엔트리.
      if (
        evt.type.startsWith("rate_group.") ||
        evt.type.startsWith("rate_sheet.")
      ) {
        const rateGroupId = idFrom("rateGroupId");
        qc.invalidateQueries({ queryKey: QUERY_KEYS.rateGroup.all });
        if (rateGroupId) {
          qc.invalidateQueries({
            queryKey: QUERY_KEYS.rateGroup.entries(rateGroupId),
          });
        }
      }
      if (evt.type.startsWith("rate_zone.")) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.rateZone.all });
      }
      if (evt.type.startsWith("driver_rate_assignment.")) {
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.driverRateAssignment.all,
        });
      }
      if (evt.type.startsWith("addon.")) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.addon.all });
      }
      if (evt.type.startsWith("service_area.")) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.serviceArea.all });
        // 영업권역이 바뀌면 scope=true zip/도시 검색 결과도 달라진다.
        qc.invalidateQueries({ queryKey: QUERY_KEYS.zipCode.all });
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
        default:
          // 알 수 없는 type — 무시.
          break;
      }
    });

    return () => {
      off();
    };
  }, [isBootstrapped, user, teamId, qc]);

  return <>{children}</>;
}
