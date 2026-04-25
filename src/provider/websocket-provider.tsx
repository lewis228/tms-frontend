import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { shipmentWs, type ServerEvent } from "@/lib/websocket";
import { useSession } from "@/store/session";
import { useTenantScope } from "@/store/tenant-scope";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * App 레벨 WebSocket 마운트.
 *
 * `tenant_id` 가 바뀌거나 세션이 만료되면 연결을 재수립한다. 이벤트는 React Query
 * 캐시 무효화 + 선택적 toast 로 처리. 채팅은 향후 같은 훅 베이스에서 타입 분기만
 * 추가하면 된다.
 *
 * SessionProvider / MemberOnlyLayout 가 세션을 확정한 뒤에만 tenantId 가 세팅되므로
 * 여기서 별도 가드는 불필요 — tenantId 가 null 이면 connect 를 skip 한다.
 */
export default function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const tenantId = useTenantScope();
  const { t } = useTranslation();

  useEffect(() => {
    if (!session || tenantId === null) {
      shipmentWs.disconnect();
      return;
    }
    shipmentWs.connect(tenantId);

    const unsubscribe = shipmentWs.addListener((evt: ServerEvent) => {
      switch (evt.type) {
        case "shipment.created":
        case "shipment.updated":
        case "shipment.status.changed": {
          // 리스트 뷰 + 상세 뷰 양쪽 다 갱신. byId 캐시가 있으면 refetch 되고
          // 없으면 다음 방문 시 최신 데이터.
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.oceanShipment.all,
          });
          const shipmentId = evt.payload?.shipment_id as number | undefined;
          if (shipmentId !== undefined) {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.oceanShipment.byId(shipmentId),
            });
          }
          // 주요 상태 전이는 토스트로 알림 — pending → tracking / failed 만.
          if (evt.type === "shipment.status.changed") {
            const newStatus = evt.payload?.new_status as string | undefined;
            const mbl = evt.payload?.mbl as string | undefined;
            if (mbl && (newStatus === "tracking" || newStatus === "failed")) {
              const key =
                newStatus === "tracking"
                  ? "events.shipmentTracking"
                  : "events.shipmentFailed";
              toast.info(t(key, { mbl }), { position: "top-center" });
            }
          }
          break;
        }
        default:
          // 향후 chat.* / notification.* 등 추가.
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [session, tenantId, queryClient, t]);

  return <>{children}</>;
}
