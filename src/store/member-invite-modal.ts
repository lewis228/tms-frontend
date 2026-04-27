import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

// Standalone open/close store for the "Invite member" modal. Form state
// lives inside the modal component — this is just the gate.

type State = { isOpen: boolean };

const initialState: State = { isOpen: false };

const useMemberInviteModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "MemberInviteModalStore" },
  ),
);

export const useOpenMemberInviteModal = () =>
  useMemberInviteModalStore((s) => s.actions.open);

export const useCloseMemberInviteModal = () =>
  useMemberInviteModalStore((s) => s.actions.close);

export const useMemberInviteModal = () => {
  const store = useMemberInviteModalStore();
  return store;
};
