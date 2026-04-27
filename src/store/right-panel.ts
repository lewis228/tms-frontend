import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";

// ste pattern: drag-resizable right panel for chat/notifications. Width
// is persisted so the user's choice survives reloads. The collapse flag
// flips visibility; drag re-expansion handled by Header / TeamScopedLayout.

export const RIGHT_PANEL_MIN_WIDTH = 600;
export const RIGHT_PANEL_MAX_WIDTH = 1100;
const RIGHT_PANEL_DEFAULT_WIDTH = 900;

const clampWidth = (w: number) =>
  Math.min(RIGHT_PANEL_MAX_WIDTH, Math.max(RIGHT_PANEL_MIN_WIDTH, w));

type State = {
  /** Whether the right panel is collapsed */
  isCollapsed: boolean;
  /** Current width in px when expanded. Persisted so the user's choice
   * survives reloads. Clamped between MIN and MAX. */
  width: number;
};

const initialState: State = {
  isCollapsed: true,
  width: RIGHT_PANEL_DEFAULT_WIDTH,
};

const useRightPanelStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        actions: {
          toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
          setCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
          setWidth: (width: number) => set({ width: clampWidth(width) }),
        },
      })),
      {
        name: "RightPanelStore",
        version: 1,
        partialize: (store) => ({
          width: clampWidth(store.width),
          isCollapsed: store.isCollapsed,
        }),
      },
    ),
    { name: "RightPanelStore" },
  ),
);

export const useIsRightPanelCollapsed = () =>
  useRightPanelStore((s) => s.isCollapsed);
export const useToggleRightPanel = () =>
  useRightPanelStore((s) => s.actions.toggle);
export const useRightPanelWidth = () => useRightPanelStore((s) => s.width);
export const useSetRightPanelWidth = () =>
  useRightPanelStore((s) => s.actions.setWidth);
