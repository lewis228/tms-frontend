import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

// Simple boolean store — the form lives inside the modal itself. Opener
// pages only need to call `open()`.
type State = { isOpen: boolean };

const initialState: State = { isOpen: false };

const useApiKeyCreateModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "ApiKeyCreateModalStore" },
  ),
);

export const useOpenApiKeyCreateModal = () =>
  useApiKeyCreateModalStore((s) => s.actions.open);

export const useCloseApiKeyCreateModal = () =>
  useApiKeyCreateModalStore((s) => s.actions.close);

export const useApiKeyCreateModal = () => {
  const store = useApiKeyCreateModalStore();
  return store;
};
