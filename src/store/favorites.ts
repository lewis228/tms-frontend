import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";

// Favourites are a UX preference — pinned paths the user wants quick access to.
// Stored in localStorage because they should survive reloads (unlike the session
// store, which is forbidden from `persist` because stale role/name must be
// re-validated on every mount).
//
// Each favourite carries the minimum needed to render a sidebar row without
// re-deriving from the nav config — path (routing), title (label), iconName
// (lookup in a lucide-react map). Icons themselves can't be serialised, so we
// store a string key and the Sidebar resolves it at render time.

export type FavoriteItem = {
  path: string;
  title: string;
  iconName: string;
};

type State = {
  items: FavoriteItem[];
};

// First-time users land on the Dashboard, so pre-pinning it in Favorites
// gives them the intended "single-click back to home" shortcut out of the
// box. The empty path matches the Dashboard leaf in NAV_CONFIG (root of
// the tenant-scoped routes) and the title/iconName keys mirror it so the
// sidebar renderer picks up the exact same label + icon.
const DEFAULT_FAVORITES: FavoriteItem[] = [
  { path: "dashboard", title: "nav.dashboard", iconName: "LayoutDashboard" },
];

const initialState: State = { items: DEFAULT_FAVORITES };

// Strip `/app/{tenantId}/` prefix and any leading `/` so favorites are
// tenant-agnostic AND match the relative-path convention of nav-config
// (e.g. "dashboard", "delivery-orders").
const normalisePath = (path: string) =>
  path.replace(/^\/app\/\d+\/?/, "").replace(/^\//, "");

const useFavoritesStore = create(
  devtools(
    persist(
      combine(initialState, (set, get) => ({
        actions: {
          // Atomic toggle keyed by path. Used by the Header star button so
          // callers don't need to know whether the current page is pinned.
          // Path is normalised so re-toggling from a different tenant still
          // finds the existing row.
          toggle: (item: FavoriteItem) => {
            const normalised = { ...item, path: normalisePath(item.path) };
            const { items } = get();
            const existing = items.find((i) => i.path === normalised.path);
            if (existing) {
              set({
                items: items.filter((i) => i.path !== normalised.path),
              });
            } else {
              set({ items: [...items, normalised] });
            }
          },
          remove: (path: string) => {
            const normalised = normalisePath(path);
            set((s) => ({
              items: s.items.filter((i) => i.path !== normalised),
            }));
          },
          // Keep manual reorder open as a hook — the sidebar doesn't expose
          // drag yet but the store is ready when it does.
          reorder: (next: FavoriteItem[]) => set({ items: next }),
        },
      })),
      {
        name: "FavoritesStore",
        // v2 moved to tenant-agnostic paths; migrate legacy rows by stripping
        // the `/app/{tenantId}` prefix. v3 adds Dashboard as a default pin
        // for anyone whose saved list is empty — respects customised lists
        // (keep as-is), just fills the void for fresh installs that already
        // persisted an empty `items: []` before this change.
        version: 4,
        migrate: (persisted, version) => {
          const state = persisted as { items?: FavoriteItem[] } | undefined;
          let items = state?.items ?? [];
          // v4: relative-path convention — strip /app/{tenantId}/ AND leading /.
          if (version < 4) {
            items = items
              .map((i) => ({ ...i, path: normalisePath(i.path) }))
              .filter((i) => i.path.length > 0);
          }
          if (items.length === 0) {
            items = DEFAULT_FAVORITES;
          }
          return { items };
        },
        // actions are functions; persist middleware refuses to serialise them.
        // Whitelist only the data slice.
        partialize: (store) => ({ items: store.items }),
      },
    ),
    { name: "FavoritesStore" },
  ),
);

export const useFavorites = () => useFavoritesStore((s) => s.items);

export const useIsFavorited = (path: string) => {
  const normalised = normalisePath(path);
  return useFavoritesStore((s) =>
    s.items.some((i) => i.path === normalised),
  );
};

export const useToggleFavorite = () =>
  useFavoritesStore((s) => s.actions.toggle);

export const useRemoveFavorite = () =>
  useFavoritesStore((s) => s.actions.remove);
