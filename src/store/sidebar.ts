import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";

type State = {
  isCollapsed: boolean;
};

const initialState: State = { isCollapsed: false };

const useSidebarStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        actions: {
          toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
          setCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
        },
      })),
      {
        name: "SidebarStore",
        // Persist only the collapse state; actions can't be serialized.
        partialize: (store) => ({ isCollapsed: store.isCollapsed }),
      },
    ),
    { name: "SidebarStore" },
  ),
);

export const useIsSidebarCollapsed = () =>
  useSidebarStore((s) => s.isCollapsed);
export const useToggleSidebar = () =>
  useSidebarStore((s) => s.actions.toggle);
export const useSetSidebarCollapsed = () =>
  useSidebarStore((s) => s.actions.setCollapsed);
