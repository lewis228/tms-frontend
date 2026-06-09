import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { DriverRateAssignmentEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = {
  isOpen: true;
  type: "EDIT";
  assignment: DriverRateAssignmentEntity;
};
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useDriverRateAssignmentEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (assignment: DriverRateAssignmentEntity) =>
          set({ isOpen: true, type: "EDIT", assignment }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "DriverRateAssignmentEditorModalStore" },
  ),
);

export const useOpenCreateDriverRateAssignmentModal = () =>
  useDriverRateAssignmentEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditDriverRateAssignmentModal = () =>
  useDriverRateAssignmentEditorModalStore((s) => s.actions.openEdit);
export const useDriverRateAssignmentEditorModal = () => {
  const store = useDriverRateAssignmentEditorModalStore();
  return store as typeof store & State;
};
