// 사이드바 — nav-config + favorites.
//
// 패턴 변경 (ste pattern):
//  - nav-config 의 path 는 /app/:tenantId 하위의 상대 경로 ("dashboard" 등).
//  - 현재 URL 의 :tenantId 를 prefix 로 붙여 최종 Link href 를 만든다.
//  - favorite store 의 path 도 같은 상대 경로 (tenant 전환 시 즐겨찾기 유지).
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  type NavIconName,
  relativizeAppPath,
  visibleNavFor,
} from "@/lib/nav-config";
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
  const params = useParams();
  const tenantId = params.tenantId ? Number(params.tenantId) : null;

  const nodes = visibleNavFor(role);
  const favorites = useFavorites();
  const currentRelative = relativizeAppPath(location.pathname);

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
                  tenantId={tenantId}
                  active={currentRelative === fav.path}
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
                tenantId={tenantId}
                iconName={node.iconName}
                active={currentRelative === node.path}
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
                    tenantId={tenantId}
                    iconName={leaf.iconName}
                    active={
                      currentRelative === leaf.path ||
                      (currentRelative != null &&
                        currentRelative.startsWith(leaf.path + "/"))
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
  tenantId,
  iconName,
  active,
}: {
  label: string;
  path: string;
  tenantId: number | null;
  iconName: NavIconName;
  active: boolean;
}) {
  const { t } = useTranslation();
  const isFav = useIsFavorited(path);
  const toggle = useToggleFavorite();

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ path, title: label, iconName });
  };

  // tenantId 가 없을 일은 (TenantScopedLayout 하위) 사실상 없지만 방어적으로 빈 href.
  const href = tenantId != null ? `/app/${tenantId}/${path}` : "#";

  return (
    <Link
      to={href}
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
        title={t(isFav ? "favorites.removeFromFavorites" : "favorites.addToFavorites")}
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
  tenantId,
  active,
}: {
  fav: FavoriteItem;
  tenantId: number | null;
  active: boolean;
}) {
  const { t } = useTranslation();
  const toggle = useToggleFavorite();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ path: fav.path, title: fav.title, iconName: fav.iconName });
  };

  const href = tenantId != null ? `/app/${tenantId}/${fav.path}` : "#";

  return (
    <Link
      to={href}
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
        title={t("favorites.removeFromFavorites")}
        className="text-amber-500"
      >
        ★
      </button>
    </Link>
  );
}
