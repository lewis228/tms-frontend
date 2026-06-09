import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const initialState = { isOpen: false };

const useInvoiceCreateModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "InvoiceCreateModalStore" },
  ),
);

export const useOpenInvoiceCreateModal = () =>
  useInvoiceCreateModalStore((s) => s.actions.open);
export const useInvoiceCreateModal = () => {
  const store = useInvoiceCreateModalStore();
  return store;
};
