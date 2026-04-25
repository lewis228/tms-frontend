// WebSocket 마운트. 백엔드 envelope 와 매칭하는 어댑터 — `lib/websocket.ts` 의 ws
// 클라이언트가 실제 연결을 관리하고, 여기서는 React Query 캐시 무효화/토스트 처리만.
//
// Phase 2 Foundation: 빈 listener — 실제 캐시 키 매핑은 Phase 3+ 에서 도메인별로 추가.
// 백엔드 이벤트 타입: do.created/status_changed, leg.created/status_changed,
//                     file.uploaded, settlement.calculated/adjusted/approved/unapproved.
import { useEffect } from "react";

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
  const isBootstrapped = useIsBootstrapped();
  const user = useCurrentUser();
  const tenantId = useCurrentTenantId();

  useEffect(() => {
    if (!isBootstrapped || !user || !tenantId) {
      realtimeWs.disconnect();
      return;
    }
    realtimeWs.connect(tenantId);
    const off = realtimeWs.addListener((_evt: ServerEvent) => {
      // Phase 3+ 에서 도메인별 캐시 무효화 / 토스트 추가.
    });
    return () => {
      off();
    };
  }, [isBootstrapped, user, tenantId]);

  return <>{children}</>;
}
