import GlobalLoader from "@/components/global-loader";
import { fetchMe } from "@/api/auth";
import { useIsSessionLoaded, useSession, useSetSession } from "@/store/session";
import { onAuthBroadcast } from "@/lib/auth-broadcast";
import { clearAccessToken } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

export default function SessionProvider({ children }: { children: ReactNode }) {
  const setSession = useSetSession();
  const isSessionLoaded = useIsSessionLoaded();
  const session = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    // Demo mode — VITE_MOCK_SESSION=true skips /user/me and injects a demo user.
    // Remove the flag (or set to "false") once a real backend is connected.
    if (import.meta.env.VITE_MOCK_SESSION === "true") {
      setSession({
        user: {
          id: "demo",
          email: "demo@example.com",
          name: "Demo User",
          role: "user",
          auth_provider: "password",
          phone: null,
          notification_email: null,
          event_notification_enabled: false,
          language: "auto",
          teams: [
            {
              id: 1,
              team_id: 1,
              team_name: "Demo Team",
              permission_group_id: null,
            },
          ],
          files: [],
        },
      });
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) setSession({ user: me });
      } catch {
        if (!cancelled) setSession(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setSession]);

  // Axios interceptor dispatches this when refresh fails mid-session.
  // Clearing the Zustand session triggers MemberOnlyLayout to redirect to
  // /sign-in declaratively — no hard window.location navigation needed.
  useEffect(() => {
    const handler = () => setSession(null);
    window.addEventListener("auth:session-expired", handler);
    return () => window.removeEventListener("auth:session-expired", handler);
  }, [setSession]);

  // Cross-tab auth sync. Another tab logging in/out writes `auth:version`;
  // we react by refreshing this tab's session state. Skip demo mode, where
  // localStorage writes would incorrectly clear the mock session.
  useEffect(() => {
    if (import.meta.env.VITE_MOCK_SESSION === "true") return;
    const currentUid = session ? String(session.user.id) : null;
    const unsubscribe = onAuthBroadcast((event) => {
      if (event.type === "logout") {
        queryClient.clear();
        clearAccessToken();
        setSession(null);
        return;
      }
      // Login from another tab. If the account differs from this tab's, do a
      // full reload so protected pages re-bootstrap under the new user. Same
      // account (e.g. re-login) is a no-op — fetchMe on next query covers it.
      if (currentUid !== null && event.uid !== currentUid) {
        window.location.reload();
      }
    });
    return unsubscribe;
  }, [queryClient, session, setSession]);

  if (!isSessionLoaded) return <GlobalLoader />;
  return children;
}
