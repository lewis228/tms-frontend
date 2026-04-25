import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";

// Generic "column layout per grid" store. Each grid instance addresses its
// slot by a **domainKey** string (e.g. `"ocean.recentlyAdded"`). The store
// remembers per-key which columns are visible + the display order.
//
// Fixed columns (e.g. the MBL identifier, the Actions cell) are **not**
// persisted here — the grid renders them unconditionally and they're
// excluded from the reorder/toggle UI. The store only tracks the middle
// "user-configurable" slice.
//
// Design notes:
// - We store column **keys**, not indices, so adding a new column to the
//   grid later won't scramble existing users' saved order.
// - `visible: Record<key, boolean>` maps explicit user choices; anything
//   absent falls back to the definition's `defaultVisible` so new columns
//   light up for existing users instead of silently disappearing.
// - `order: string[]` is the user's explicit order for the configurable
//   slice. Keys the user hasn't seen are appended on read (see the
//   `useGridColumnConfig` selector below).

export type GridColumnDefinition = {
  key: string;
  labelKey: string; // i18n key
  fixed?: boolean;
  defaultVisible?: boolean; // defaults to true when omitted
};

type ColumnConfig = {
  order: string[];
  visible: Record<string, boolean>;
};

type State = {
  byDomain: Record<string, ColumnConfig>;
};

const initialState: State = { byDomain: {} };

const useGridColumnConfigStore = create(
  devtools(
    persist(
      combine(initialState, (set, get) => ({
        actions: {
          // Idempotent bootstrap — safe to call every render. Writes only
          // when the persisted slot is missing or when the definition list
          // has new keys (for forward compat with added columns). Existing
          // user order is preserved; new reorderable keys are appended in
          // definition order.
          ensureDomain: (
            domainKey: string,
            definitions: GridColumnDefinition[],
          ) => {
            const reorderable = definitions.filter((d) => !d.fixed);
            const current = get().byDomain[domainKey];
            const knownKeys = new Set(reorderable.map((d) => d.key));

            if (!current) {
              const next: ColumnConfig = {
                order: reorderable.map((d) => d.key),
                visible: Object.fromEntries(
                  reorderable.map((d) => [d.key, d.defaultVisible ?? true]),
                ),
              };
              set((s) => ({
                byDomain: { ...s.byDomain, [domainKey]: next },
              }));
              return;
            }

            // Merge newly introduced columns while preserving existing order.
            const missingKeys = reorderable
              .map((d) => d.key)
              .filter((k) => !current.order.includes(k));
            const staleKeys = current.order.filter((k) => !knownKeys.has(k));

            if (missingKeys.length === 0 && staleKeys.length === 0) return;

            const cleanedOrder = current.order.filter((k) => knownKeys.has(k));
            const nextOrder = [...cleanedOrder, ...missingKeys];
            const nextVisible: Record<string, boolean> = { ...current.visible };
            for (const key of missingKeys) {
              const def = reorderable.find((d) => d.key === key);
              nextVisible[key] = def?.defaultVisible ?? true;
            }
            for (const key of staleKeys) delete nextVisible[key];

            set((s) => ({
              byDomain: {
                ...s.byDomain,
                [domainKey]: { order: nextOrder, visible: nextVisible },
              },
            }));
          },

          setVisibility: (domainKey: string, columnKey: string, visible: boolean) => {
            set((s) => {
              const current = s.byDomain[domainKey];
              if (!current) return s;
              return {
                byDomain: {
                  ...s.byDomain,
                  [domainKey]: {
                    ...current,
                    visible: { ...current.visible, [columnKey]: visible },
                  },
                },
              };
            });
          },

          // Move `columnKey` to the `targetIndex` position within the
          // reorderable slice. Caller is responsible for passing a valid
          // index (0 .. order.length - 1).
          reorderByKey: (domainKey: string, columnKey: string, targetIndex: number) => {
            set((s) => {
              const current = s.byDomain[domainKey];
              if (!current) return s;
              const currentIndex = current.order.indexOf(columnKey);
              if (currentIndex === -1) return s;
              const next = current.order.slice();
              next.splice(currentIndex, 1);
              const clamped = Math.max(0, Math.min(targetIndex, next.length));
              next.splice(clamped, 0, columnKey);
              return {
                byDomain: {
                  ...s.byDomain,
                  [domainKey]: { ...current, order: next },
                },
              };
            });
          },

          resetDomain: (
            domainKey: string,
            definitions: GridColumnDefinition[],
          ) => {
            const reorderable = definitions.filter((d) => !d.fixed);
            set((s) => ({
              byDomain: {
                ...s.byDomain,
                [domainKey]: {
                  order: reorderable.map((d) => d.key),
                  visible: Object.fromEntries(
                    reorderable.map((d) => [d.key, d.defaultVisible ?? true]),
                  ),
                },
              },
            }));
          },
        },
      })),
      {
        name: "GridColumnConfigStore",
        version: 1,
        partialize: (store) => ({ byDomain: store.byDomain }),
      },
    ),
    { name: "GridColumnConfigStore" },
  ),
);

// ─── Selectors ────────────────────────────────────────────────

export const useGridColumnConfig = (domainKey: string) =>
  useGridColumnConfigStore((s) => s.byDomain[domainKey]);

export const useEnsureGridColumnConfig = () =>
  useGridColumnConfigStore((s) => s.actions.ensureDomain);

export const useSetGridColumnVisibility = () =>
  useGridColumnConfigStore((s) => s.actions.setVisibility);

export const useReorderGridColumnByKey = () =>
  useGridColumnConfigStore((s) => s.actions.reorderByKey);

export const useResetGridColumnConfig = () =>
  useGridColumnConfigStore((s) => s.actions.resetDomain);
