// Dual Transaction 생성 모달 — open/close.
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const initialState = { isOpen: false };

const useDualTransactionCreateModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "DualTransactionCreateModalStore" },
  ),
);

export const useOpenCreateDualTransactionModal = () =>
  useDualTransactionCreateModalStore((s) => s.actions.open);

export const useDualTransactionCreateModal = () =>
  useDualTransactionCreateModalStore();
