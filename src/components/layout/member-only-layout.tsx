import { useSession } from "@/store/session";
import { useSetRedirect } from "@/store/redirect";
import { isMobileWeb } from "@/lib/platform";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function MemberOnlyLayout() {
  const session = useSession();
  const setRedirect = useSetRedirect();
  const location = useLocation();

  // Desktop-first gate. Bounce mobile users to the dedicated page so the
  // table-heavy app shell never attempts to render on a narrow screen.
  if (isMobileWeb()) {
    return <Navigate to={"/mobile-coming-soon"} replace={true} />;
  }

  if (!session) {
    // Stash the intended destination so the sign-in mutation can resume it.
    // Skip the bare `/app` hub — landing there after login is already the
    // default behaviour, no need to remember it.
    const target = `${location.pathname}${location.search}${location.hash}`;
    if (target !== "/app") {
      setRedirect(target);
    }
    return <Navigate to={"/sign-in"} replace={true} />;
  }
  return <Outlet />;
}
