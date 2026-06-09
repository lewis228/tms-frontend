import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { RatePointEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; ratePoint: RatePointEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useRatePointEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (ratePoint: RatePointEntity) =>
          set({ isOpen: true, type: "EDIT", ratePoint }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "RatePointEditorModalStore" },
  ),
);

export const useOpenCreateRatePointModal = () =>
  useRatePointEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditRatePointModal = () =>
  useRatePointEditorModalStore((s) => s.actions.openEdit);
export const useRatePointEditorModal = () => {
  const store = useRatePointEditorModalStore();
  return store as typeof store & State;
};
