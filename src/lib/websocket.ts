// 백엔드 WebSocket 클라이언트. ste 의 ShipmentWebSocket 패턴을 그대로 차용 +
// 백엔드 envelope 매칭 (`{type, teamId, actorId, payload, occurredAt}`).
//
// 백엔드 endpoint: `WS /api/v1/ws?token=<accessJWT>&team_id=<id>` (SUPER_ADMIN 만 query).
// Close codes: 4001 EXPIRED / 4002 INVALID / 4003 NO_TEAM / 4004 IDLE_TIMEOUT.
//
// 클라:
// - 30s 마다 ping 전송. 60s pong 없어도 backend idle close 로 정리됨.
// - 서버 ping 받으면 즉시 pong 응답.
// - 만료 직전이면 connect 전에 refreshAccessToken().
// - 4001(EXPIRED) close → refresh 후 reconnect.
// - 그 외 close → exponential backoff 재연결.
import {
  API_BASE_URL,
  isAccessTokenExpiringSoon,
  refreshAccessToken,
} from "@/lib/axios";
import { getAccessToken, getCurrentRoleModule } from "@/store/auth";

export type ServerEvent = {
  type: string;
  teamId: string;
  actorId: string | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
};

type EventListener = (evt: ServerEvent) => void;

const PING_INTERVAL_MS = 30_000;
const CLOSE_EXPIRED = 4001;

function wsUrlFor(teamId: string, token: string): string {
  const httpBase = API_BASE_URL.replace(/^http(s?):\/\//, "ws$1://");
  const role = getCurrentRoleModule();
  const url = new URL(`${httpBase}/api/v1/ws`);
  url.searchParams.set("token", token);
  if (role === "SUPER_ADMIN") {
    url.searchParams.set("team_id", teamId);
  }
  return url.toString();
}

class RealtimeWebSocket {
  private ws: WebSocket | null = null;
  private teamId: string | null = null;
  private listeners: Set<EventListener> = new Set();
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryAttempt = 0;
  private intentionalClose = false;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  connect(teamId: string): void {
    if (this.teamId === teamId && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    this.disconnect();
    this.teamId = teamId;
    this.intentionalClose = false;
    void this._open();
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.teamId = null;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // no-op
      }
      this.ws = null;
    }
    this.retryAttempt = 0;
  }

  addListener(fn: EventListener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private async _open(): Promise<void> {
    const teamId = this.teamId;
    if (teamId === null) return;

    let token = getAccessToken();
    if (!token || isAccessTokenExpiringSoon()) {
      try {
        token = await refreshAccessToken();
      } catch {
        return;
      }
    }

    if (this.intentionalClose || this.teamId !== teamId || !token) {
      return;
    }

    try {
      const ws = new WebSocket(wsUrlFor(teamId, token));
      this.ws = ws;

      ws.onopen = () => {
        this.retryAttempt = 0;
        this._startHeartbeat();
      };
      ws.onmessage = (event) => {
        let parsed: unknown = null;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          return;
        }
        if (
          parsed === null ||
          typeof parsed !== "object" ||
          !("type" in parsed)
        ) {
          return;
        }
        const obj = parsed as Record<string, unknown>;
        if (obj.type === "ping") {
          try {
            ws.send(JSON.stringify({ type: "pong" }));
          } catch {
            // ignore
          }
          return;
        }
        if (obj.type === "pong") return;
        const evt = obj as unknown as ServerEvent;
        for (const fn of this.listeners) {
          try {
            fn(evt);
          } catch {
            // 개별 리스너 실패가 다른 리스너를 막지 않도록 삼킨다.
          }
        }
      };
      ws.onerror = () => {
        // onclose 가 이어 실행되므로 여기선 no-op.
      };
      ws.onclose = (event) => {
        this.ws = null;
        if (this.pingTimer) {
          clearInterval(this.pingTimer);
          this.pingTimer = null;
        }
        if (this.intentionalClose) return;
        if (event.code === CLOSE_EXPIRED) {
          void (async () => {
            try {
              await refreshAccessToken();
            } catch {
              return;
            }
            void this._open();
          })();
          return;
        }
        this._scheduleReconnect();
      };
    } catch {
      this._scheduleReconnect();
    }
  }

  private _startHeartbeat(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: "ping" }));
        } catch {
          // ignore — 다음 onclose 가 처리.
        }
      }
    }, PING_INTERVAL_MS);
  }

  private _scheduleReconnect(): void {
    if (this.retryTimer !== null) return;
    const delay = Math.min(30_000, 1_000 * 2 ** this.retryAttempt);
    this.retryAttempt += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this._open();
    }, delay);
  }
}

export const realtimeWs = new RealtimeWebSocket();
