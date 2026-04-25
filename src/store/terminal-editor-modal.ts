import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { TerminalEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; terminal: TerminalEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useTerminalEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (terminal: TerminalEntity) =>
          set({ isOpen: true, type: "EDIT", terminal }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "TerminalEditorModalStore" },
  ),
);

export const useOpenCreateTerminalModal = () =>
  useTerminalEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditTerminalModal = () =>
  useTerminalEditorModalStore((s) => s.actions.openEdit);
export const useTerminalEditorModal = () => {
  const store = useTerminalEditorModalStore();
  return store as typeof store & State;
};
