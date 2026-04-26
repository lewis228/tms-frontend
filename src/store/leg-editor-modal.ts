import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { LegEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE"; deliveryOrderId: number };
type OpenEdit = { isOpen: true; type: "EDIT"; leg: LegEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useLegEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: (deliveryOrderId: number) =>
          set({ isOpen: true, type: "CREATE", deliveryOrderId }),
        openEdit: (leg: LegEntity) =>
          set({ isOpen: true, type: "EDIT", leg }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "LegEditorModalStore" },
  ),
);

export const useOpenCreateLegModal = () =>
  useLegEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditLegModal = () =>
  useLegEditorModalStore((s) => s.actions.openEdit);
export const useLegEditorModal = () => {
  const store = useLegEditorModalStore();
  return store as typeof store & State;
};
