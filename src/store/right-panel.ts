import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";
import type { User } from "@/types";

export const RIGHT_PANEL_MIN_WIDTH = 600;
export const RIGHT_PANEL_MAX_WIDTH = 1100;
const RIGHT_PANEL_DEFAULT_WIDTH = 900;

const clampWidth = (w: number) =>
  Math.min(RIGHT_PANEL_MAX_WIDTH, Math.max(RIGHT_PANEL_MIN_WIDTH, w));

type State = {
  /** Whether the notifications right panel is collapsed */
  isCollapsed: boolean;
  /** Current width in px when expanded. Persisted so the user's choice
   * survives reloads. Clamped between MIN and MAX. */
  width: number;
  /** Whether the user detail panel (inside users page) is open */
  isUserDetailOpen: boolean;
  /** Currently selected user for user-detail mode */
  selectedUser: User | null;
  /** All users in the current list – used for up/down navigation */
  userList: User[];
};

const initialState: State = {
  // Default to CLOSED for first-time visitors. Users can open via the
  // header toggle; their choice is then persisted via the store below.
  isCollapsed: true,
  width: RIGHT_PANEL_DEFAULT_WIDTH,
  isUserDetailOpen: false,
  selectedUser: null,
  userList: [],
};

const useRightPanelStore = create(
  devtools(
    persist(
      combine(initialState, (set, get) => ({
        actions: {
          /** Toggle the notifications panel */
          toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
          setCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
          setWidth: (width: number) => set({ width: clampWidth(width) }),

          /** Toggle the user detail panel open/close */
          toggleUserDetail: () =>
            set((s) => ({ isUserDetailOpen: !s.isUserDetailOpen })),

          /** Open the user-detail panel for a specific user */
          showUserDetail: (user: User, list: User[]) =>
            set({
              isUserDetailOpen: true,
              selectedUser: user,
              userList: list,
            }),

          /** Navigate to prev/next user within the current list */
          navigateUser: (direction: "prev" | "next") => {
            const { selectedUser, userList } = get();
            if (!selectedUser || userList.length === 0) return;
            const idx = userList.findIndex((u) => u.id === selectedUser.id);
            if (idx === -1) return;
            const nextIdx = direction === "prev" ? idx - 1 : idx + 1;
            if (nextIdx < 0 || nextIdx >= userList.length) return;
            set({ selectedUser: userList[nextIdx] });
          },

          /** Close user-detail panel */
          closeUserDetail: () =>
            set({ isUserDetailOpen: false, selectedUser: null }),

          /** Update the user list (e.g. when page data changes) */
          setUserList: (list: User[]) => set({ userList: list }),
        },
      })),
      {
        name: "RightPanelStore",
        // v2 widened the panel for the chat UI (was 280..420, now 600..1100).
        // v3 flipped the default to CLOSED — existing persisted state from
        // v2 would otherwise keep legacy users opened-by-default. We wipe
        // the persisted slice on v2→v3 so their first render after the
        // upgrade matches the new default (closed, default width).
        version: 3,
        migrate: (_persisted, version) => {
          if (version < 3) {
            return {
              width: RIGHT_PANEL_DEFAULT_WIDTH,
              isCollapsed: true,
            };
          }
          return _persisted as { width: number; isCollapsed: boolean };
        },
        // Persist the drag-resized width AND the open/close state so users
        // return to the exact same layout on reload. user-detail state is
        // session-scoped so it stays out of storage.
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
export const useIsUserDetailOpen = () =>
  useRightPanelStore((s) => s.isUserDetailOpen);
export const useRightPanelMode = () =>
  useRightPanelStore((s) =>
    s.isUserDetailOpen ? ("user-detail" as const) : ("notifications" as const),
  );
export const useSelectedUser = () =>
  useRightPanelStore((s) => s.selectedUser);
export const useRightPanelActions = () =>
  useRightPanelStore((s) => s.actions);
