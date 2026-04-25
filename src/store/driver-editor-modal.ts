import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { DriverEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; driver: DriverEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useDriverEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (driver: DriverEntity) =>
          set({ isOpen: true, type: "EDIT", driver }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "DriverEditorModalStore" },
  ),
);

export const useOpenCreateDriverModal = () =>
  useDriverEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditDriverModal = () =>
  useDriverEditorModalStore((s) => s.actions.openEdit);
export const useDriverEditorModal = () => {
  const store = useDriverEditorModalStore();
  return store as typeof store & State;
};
