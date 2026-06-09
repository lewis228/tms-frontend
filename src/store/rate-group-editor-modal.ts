import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { RateGroupEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; rateGroup: RateGroupEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useRateGroupEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (rateGroup: RateGroupEntity) =>
          set({ isOpen: true, type: "EDIT", rateGroup }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "RateGroupEditorModalStore" },
  ),
);

export const useOpenCreateRateGroupModal = () =>
  useRateGroupEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditRateGroupModal = () =>
  useRateGroupEditorModalStore((s) => s.actions.openEdit);
export const useRateGroupEditorModal = () => {
  const store = useRateGroupEditorModalStore();
  return store as typeof store & State;
};
