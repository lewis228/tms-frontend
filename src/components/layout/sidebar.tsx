// 단순 사이드바 — Phase 2 Foundation.
// nav-config 의 visibleNavFor(role) 결과만 렌더. role 가드는 데이터 기반.
//
// 향후 Phase 5+ 에서 favorites / 검색 / collapse / 채팅 패널 등을 ste 패턴으로 복원.
import { Link, useLocation } from "react-router-dom";

import { type NavIconName, visibleNavFor } from "@/lib/nav-config";
import { clearAuth, useCurrentRole, useCurrentUser } from "@/store/auth";

export default function Sidebar() {
  const role = useCurrentRole();
  const user = useCurrentUser();
  const location = useLocation();

  const nodes = visibleNavFor(role);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-background">
      <div className="border-b px-4 py-4">
        <div className="truncate text-sm font-medium">{user?.email ?? "—"}</div>
        <div className="text-xs text-muted-foreground">{role ?? "—"}</div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-3">
        {nodes.map((node) => {
          if (node.type === "leaf") {
            return (
              <NavLeafLink
                key={node.path}
                label={node.label}
                path={node.path}
                iconName={node.iconName}
                active={location.pathname === node.path}
              />
            );
          }
          return (
            <div key={node.label}>
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {node.label}
              </div>
              <div className="mt-1 space-y-0.5">
                {node.children.map((leaf) => (
                  <NavLeafLink
                    key={leaf.path}
                    label={leaf.label}
                    path={leaf.path}
                    iconName={leaf.iconName}
                    active={
                      location.pathname === leaf.path ||
                      location.pathname.startsWith(leaf.path + "/")
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          type="button"
          onClick={() => {
            clearAuth();
            window.location.href = "/sign-in";
          }}
          className="w-full text-left text-sm text-muted-foreground hover:text-foreground"
        >
          ↪ Sign Out
        </button>
      </div>
    </aside>
  );
}

function NavLeafLink({
  label,
  path,
  iconName: _iconName,
  active,
}: {
  label: string;
  path: string;
  iconName: NavIconName;
  active: boolean;
}) {
  return (
    <Link
      to={path}
      className={
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
        (active
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-accent/50 text-foreground/80")
      }
    >
      <span className="size-1.5 rounded-full bg-current opacity-60" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
