// Cross-tab auth synchronisation via the native `storage` event. Each tab
// listens for changes on a set of reserved localStorage keys; when the user
// signs in or out in one tab, the other tabs react in real time. The browser
// only fires `storage` events on *other* windows, so the tab that wrote the
// change doesn't self-notify — which is exactly what we want.
//
// Keys:
//   auth:version — timestamp stamp. Writing it is the broadcast signal.
//   auth:uid     — current user id (optional, for account-switch detection).
//
// Consumers subscribe via `onAuthBroadcast(listener)` and broadcast via
// `announceLogin({ uid })` / `announceLogout()`.

const VERSION_KEY = "auth:version";
const UID_KEY = "auth:uid";

export type AuthBroadcastEvent =
  | { type: "login"; uid: string | null }
  | { type: "logout" };

type Listener = (event: AuthBroadcastEvent) => void;

export function announceLogin(uid: string | null) {
  const now = Date.now().toString();
  if (uid !== null) {
    localStorage.setItem(UID_KEY, uid);
  } else {
    localStorage.removeItem(UID_KEY);
  }
  localStorage.setItem(VERSION_KEY, now);
}

export function announceLogout() {
  localStorage.removeItem(UID_KEY);
  localStorage.setItem(VERSION_KEY, Date.now().toString());
}

export function onAuthBroadcast(listener: Listener): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key !== VERSION_KEY) return;
    // A removed uid means logout; a present uid means login (possibly a
    // different account than this tab's current session — the consumer
    // decides whether to reload or just clear local state).
    const uid = localStorage.getItem(UID_KEY);
    if (uid === null) {
      listener({ type: "logout" });
    } else {
      listener({ type: "login", uid });
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
