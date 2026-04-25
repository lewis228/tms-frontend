import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { CustomerEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; customer: CustomerEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useCustomerEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (customer: CustomerEntity) =>
          set({ isOpen: true, type: "EDIT", customer }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "CustomerEditorModalStore" },
  ),
);

export const useOpenCreateCustomerModal = () =>
  useCustomerEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditCustomerModal = () =>
  useCustomerEditorModalStore((s) => s.actions.openEdit);
export const useCustomerEditorModal = () => {
  const store = useCustomerEditorModalStore();
  return store as typeof store & State;
};
