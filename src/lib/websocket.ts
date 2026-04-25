import {
  API_BASE_URL,
  getAccessToken,
  isAccessTokenExpiringSoon,
  refreshAccessToken,
} from "@/lib/axios";

// ws(s)://<api-host>/api/v1/ws 로 연결.
// API_BASE_URL 은 http(s) 기반 — ws(s) 로 스킴 치환.
function wsUrlFor(teamId: number, token: string): string {
  const httpBase = API_BASE_URL.replace(/^http(s?):\/\//, "ws$1://");
  // 프론트 axios 인스턴스의 baseURL 은 `${API_BASE_URL}/api/v1` 이라
  // WS 도 동일 prefix 아래 둔다 (main.py 의 FastAPI root).
  return `${httpBase}/api/v1/ws?token=${encodeURIComponent(token)}&team_id=${teamId}`;
}

export type ServerEvent = {
  type: string;
  timestamp: string;
  team_id: number;
  payload: Record<string, unknown>;
};

type EventListener = (evt: ServerEvent) => void;

// Singleton — App 전체에서 연결 하나만 유지한다.
// team_id 가 바뀌면 reconnect 로 재수립 (X-Team-Id 처럼 연결 단위로 바인딩).
class ShipmentWebSocket {
  private ws: WebSocket | null = null;
  private teamId: number | null = null;
  private listeners: Set<EventListener> = new Set();

  // 재연결 백오프 — 1s / 2s / 4s / 8s / cap 30s.
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryAttempt = 0;

  // 명시적 disconnect 인지, 네트워크 끊김인지 구분.
  private intentionalClose = false;

  connect(teamId: number): void {
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
    return () => this.listeners.delete(fn);
  }

  private async _open(): Promise<void> {
    const teamId = this.teamId;
    if (teamId === null) {
      // 팀 없음 — 상위(`WebSocketProvider`)가 teamId 세팅되면 connect() 재호출.
      return;
    }

    // 연결 직전 토큰 상태 점검. 만료됐거나 곧 만료면 refresh 선행 — 아니면
    // 서버가 1008(Policy Violation) 으로 핸드셰이크를 거부하고, 프론트는 같은
    // 만료 토큰으로 영영 재시도하는 루프에 빠진다 (axios 의 401 refresh 가
    // WebSocket 에는 닿지 않기 때문).
    let token = getAccessToken();
    if (!token || isAccessTokenExpiringSoon()) {
      try {
        token = await refreshAccessToken();
      } catch {
        // refresh 도 실패 = refresh 쿠키 만료 또는 세션 무효. axios 인터셉터의
        // "auth:session-expired" 이벤트 경로가 로그아웃 UI 를 담당하므로 여기선
        // 조용히 포기. 토큰이 다시 생기면 상위에서 connect() 재호출.
        return;
      }
    }

    // async 대기 중 disconnect() / 팀 전환이 일어났을 수 있으니 재확인.
    if (this.intentionalClose || this.teamId !== teamId || !token) {
      return;
    }

    try {
      const ws = new WebSocket(wsUrlFor(teamId, token));
      this.ws = ws;

      ws.onopen = () => {
        this.retryAttempt = 0;
      };
      ws.onmessage = (event) => {
        let parsed: ServerEvent | null = null;
        try {
          parsed = JSON.parse(event.data) as ServerEvent;
        } catch {
          return;
        }
        if (!parsed) return;
        for (const fn of this.listeners) {
          try {
            fn(parsed);
          } catch {
            // 개별 리스너 실패가 다른 리스너를 막지 않도록 삼킨다.
          }
        }
      };
      ws.onerror = () => {
        // onclose 가 이어서 실행되므로 여기선 no-op.
      };
      ws.onclose = () => {
        this.ws = null;
        if (this.intentionalClose) {
          return;
        }
        this._scheduleReconnect();
      };
    } catch {
      this._scheduleReconnect();
    }
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

export const shipmentWs = new ShipmentWebSocket();
