import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { RateSettingEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; rateSetting: RateSettingEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useRateSettingEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (rateSetting: RateSettingEntity) =>
          set({ isOpen: true, type: "EDIT", rateSetting }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "RateSettingEditorModalStore" },
  ),
);

export const useOpenCreateRateSettingModal = () =>
  useRateSettingEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditRateSettingModal = () =>
  useRateSettingEditorModalStore((s) => s.actions.openEdit);
export const useRateSettingEditorModal = () => {
  const store = useRateSettingEditorModalStore();
  return store as typeof store & State;
};
