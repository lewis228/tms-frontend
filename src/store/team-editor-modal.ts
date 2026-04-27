import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { TeamEntity } from "@/types";

type OpenCreate = { isOpen: true; type: "CREATE" };
type OpenEdit = { isOpen: true; type: "EDIT"; team: TeamEntity };
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate | OpenEdit;

const initialState = { isOpen: false } as State;

const useTeamEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (team: TeamEntity) =>
          set({ isOpen: true, type: "EDIT", team }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "TeamEditorModalStore" },
  ),
);

export const useOpenCreateTeamModal = () =>
  useTeamEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditTeamModal = () =>
  useTeamEditorModalStore((s) => s.actions.openEdit);
export const useTeamEditorModal = () => {
  const store = useTeamEditorModalStore();
  return store as typeof store & State;
};
