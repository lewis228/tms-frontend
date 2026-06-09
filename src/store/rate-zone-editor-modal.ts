import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { RateZoneEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; rateZone: RateZoneEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useRateZoneEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (rateZone: RateZoneEntity) =>
          set({ isOpen: true, type: "EDIT", rateZone }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "RateZoneEditorModalStore" },
  ),
);

export const useOpenCreateRateZoneModal = () =>
  useRateZoneEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditRateZoneModal = () =>
  useRateZoneEditorModalStore((s) => s.actions.openEdit);
export const useRateZoneEditorModal = () => {
  const store = useRateZoneEditorModalStore();
  return store as typeof store & State;
};
