import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { UserEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE"; tenantId: number };
type OpenEdit = {
  isOpen: true;
  type: "EDIT";
  tenantId: number;
  user: UserEntity;
};
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useSystemUserEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: (tenantId: number) =>
          set({ isOpen: true, type: "CREATE", tenantId }),
        openEdit: (tenantId: number, user: UserEntity) =>
          set({ isOpen: true, type: "EDIT", tenantId, user }),
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
