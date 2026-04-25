import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { LocationEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; location: LocationEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useLocationEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (location: LocationEntity) =>
          set({ isOpen: true, type: "EDIT", location }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "LocationEditorModalStore" },
  ),
);

export const useOpenCreateLocationModal = () =>
  useLocationEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditLocationModal = () =>
  useLocationEditorModalStore((s) => s.actions.openEdit);
export const useLocationEditorModal = () => {
  const store = useLocationEditorModalStore();
  return store as typeof store & State;
};
