import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { VesselEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; vessel: VesselEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useVesselEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (vessel: VesselEntity) =>
          set({ isOpen: true, type: "EDIT", vessel }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "VesselEditorModalStore" },
  ),
);

export const useOpenCreateVesselModal = () =>
  useVesselEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditVesselModal = () =>
  useVesselEditorModalStore((s) => s.actions.openEdit);
export const useVesselEditorModal = () => {
  const store = useVesselEditorModalStore();
  return store as typeof store & State;
};
