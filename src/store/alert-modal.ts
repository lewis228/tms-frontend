import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};

type CloseState = { isOpen: false };
type State = CloseState | OpenState;

const initialState = { isOpen: false } as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: (param: Omit<OpenState, "isOpen">) => {
          set({ isOpen: true, ...param });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: "AlertModalStore" },
  ),
);

export const useOpenAlertModal = () =>
  useAlertModalStore((s) => s.actions.open);

export const useCloseAlertModal = () =>
  useAlertModalStore((s) => s.actions.close);

export const useAlertModal = () => {
  const store = useAlertModalStore();
  return store as typeof store & State;
};
