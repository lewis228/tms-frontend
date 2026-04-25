import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { TenantEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; tenant: TenantEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useTenantEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (tenant: TenantEntity) =>
          set({ isOpen: true, type: "EDIT", tenant }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "TenantEditorModalStore" },
  ),
);

export const useOpenCreateTenantModal = () =>
  useTenantEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditTenantModal = () =>
  useTenantEditorModalStore((s) => s.actions.openEdit);
export const useTenantEditorModal = () => {
  const store = useTenantEditorModalStore();
  return store as typeof store & State;
};
