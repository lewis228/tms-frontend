import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

// Profile modal — focused standalone dialog opened from the sidebar avatar.
// Profile-only (account, security, support) — tenant-wide configuration lives
// on dedicated `/settings/*` pages instead of a modal.

const initialState = { isOpen: false };

const useProfileModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "ProfileModalStore" },
  ),
);

export const useOpenProfileModal = () =>
  useProfileModalStore((s) => s.actions.open);

export const useProfileModal = () => useProfileModalStore();
