// Per-request correlation ID. Attached to every outgoing request as
// `X-Request-ID` so server logs can be joined with browser actions when
// debugging. Re-used on retries (see axios interceptor) so a refresh cycle
// still appears as one logical request in the backend.
//
// 주의: crypto.randomUUID() 는 보안 컨텍스트(HTTPS / localhost)에서만 제공된다.
// 평문 HTTP(공인 IP 직접 접속) 에서는 undefined → 호출 시 throw. 따라서
// HTTP 에서도 동작하는 crypto.getRandomValues 기반 v4 UUID 폴백을 둔다.

function uuidV4(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  if (c && typeof c.getRandomValues === "function") {
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // variant
    const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
    return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
  }
  // 최후 폴백(무작위성 약함 — 상관관계 ID 용도라 충분)
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

export function generateRequestId(): string {
  return `rid-${uuidV4()}`;
}
