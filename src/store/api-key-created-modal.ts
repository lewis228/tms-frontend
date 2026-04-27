import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

// Reveal-once modal. Carries the full secret key surfaced from the
// creation response; the close action wipes it so it doesn't linger in
// Zustand devtools beyond its UI lifetime. State is a DU so closed state
// doesn't hold stale fields.

type OpenState = {
  isOpen: true;
  name: string;
  fullKey: string;
};

type CloseState = { isOpen: false };
type State = CloseState | OpenState;

const initialState = { isOpen: false } as State;

const useApiKeyCreatedModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: (param: Omit<OpenState, "isOpen">) =>
          set({ isOpen: true, ...param }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "ApiKeyCreatedModalStore" },
  ),
);

export const useOpenApiKeyCreatedModal = () =>
  useApiKeyCreatedModalStore((s) => s.actions.open);

export const useCloseApiKeyCreatedModal = () =>
  useApiKeyCreatedModalStore((s) => s.actions.close);

export const useApiKeyCreatedModal = () => {
  const store = useApiKeyCreatedModalStore();
  return store as typeof store & State;
};
