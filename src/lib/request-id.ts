// Per-request correlation ID. Attached to every outgoing request as
// `X-Request-ID` so server logs can be joined with browser actions when
// debugging. Re-used on retries (see axios interceptor) so a refresh cycle
// still appears as one logical request in the backend.
//
// crypto.randomUUID() is available in every browser this app supports (Vite
// targets evergreen browsers) — no fallback needed.

export function generateRequestId(): string {
  return `rid-${crypto.randomUUID()}`;
}
