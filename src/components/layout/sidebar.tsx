// 사이드바 — nav-config + favorites.
//
// FAVORITES 섹션은 사이드바 상단. 사용자가 nav-leaf 우측 별표 클릭으로 토글.
// favorites store 가 path/title/iconName 을 영구 저장 (localStorage).
import { Link, useLocation } from "react-router-dom";

import { type NavIconName, visibleNavFor } from "@/lib/nav-config";
import { clearAuth, useCurrentRole, useCurrentUser } from "@/store/auth";
import {
  type FavoriteItem,
  useFavorites,
  useIsFavorited,
  useToggleFavorite,
} from "@/store/favorites";

export default function Sidebar() {
  const role = useCurrentRole();
  const user = useCurrentUser();
  const location = useLocation();

  const nodes = visibleNavFor(role);
  const favorites = useFavorites();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-background">
      <div className="border-b px-4 py-4">
        <div className="truncate text-sm font-medium">{user?.email ?? "—"}</div>
        <div className="text-xs text-muted-foreground">{role ?? "—"}</div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-3">
        {favorites.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ⭐ Favorites
            </div>
            <div className="mt-1 space-y-0.5">
              {favorites.map((fav) => (
                <FavoriteLeafLink
                  key={fav.path}
                  fav={fav}
                  active={location.pathname === fav.path}
                />
              ))}
            </div>
          </div>
        )}

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
  iconName,
  active,
}: {
  label: string;
  path: string;
  iconName: NavIconName;
  active: boolean;
}) {
  const isFav = useIsFavorited(path);
  const toggle = useToggleFavorite();

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ path, title: label, iconName });
  };

  return (
    <Link
      to={path}
      className={
        "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
        (active
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-accent/50 text-foreground/80")
      }
    >
      <span className="size-1.5 rounded-full bg-current opacity-60" />
      <span className="flex-1 truncate">{label}</span>
      <button
        type="button"
        onClick={handleStarClick}
        title={isFav ? "Favorites 에서 제거" : "Favorites 에 추가"}
        className={
          "transition-opacity " +
          (isFav
            ? "text-amber-500"
            : "text-muted-foreground/40 opacity-0 group-hover:opacity-100")
        }
      >
        {isFav ? "★" : "☆"}
      </button>
    </Link>
  );
}

function FavoriteLeafLink({
  fav,
  active,
}: {
  fav: FavoriteItem;
  active: boolean;
}) {
  const toggle = useToggleFavorite();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ path: fav.path, title: fav.title, iconName: fav.iconName });
  };

  return (
    <Link
      to={fav.path}
      className={
        "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
        (active
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-accent/50 text-foreground/80")
      }
    >
      <span className="size-1.5 rounded-full bg-amber-500 opacity-80" />
      <span className="flex-1 truncate">{fav.title}</span>
      <button
        type="button"
        onClick={handleRemove}
        title="Favorites 에서 제거"
        className="text-amber-500"
      >
        ★
      </button>
    </Link>
  );
}
