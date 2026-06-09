import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const initialState = { isOpen: false };

const useRateSheetCreateModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "RateSheetCreateModalStore" },
  ),
);

export const useOpenRateSheetCreateModal = () =>
  useRateSheetCreateModalStore((s) => s.actions.open);
export const useRateSheetCreateModal = () => {
  const store = useRateSheetCreateModalStore();
  return store;
};
