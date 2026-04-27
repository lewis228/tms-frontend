import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { UserEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE"; teamId: number };
type OpenEdit = {
  isOpen: true;
  type: "EDIT";
  teamId: number;
  user: UserEntity;
};
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useSystemUserEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: (teamId: number) =>
          set({ isOpen: true, type: "CREATE", teamId }),
        openEdit: (teamId: number, user: UserEntity) =>
          set({ isOpen: true, type: "EDIT", teamId, user }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "SystemUserEditorModalStore" },
  ),
);

export const useOpenCreateSystemUserModal = () =>
  useSystemUserEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditSystemUserModal = () =>
  useSystemUserEditorModalStore((s) => s.actions.openEdit);
export const useSystemUserEditorModal = () => {
  const store = useSystemUserEditorModalStore();
  return store as typeof store & State;
};
