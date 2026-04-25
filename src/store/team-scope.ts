import { setCurrentTeamId } from "@/lib/team-scope";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type State = {
  teamId: number | null;
};

const initialState: State = { teamId: null };

const useTeamScopeStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        setTeamScope: (teamId: number | null) => {
          // Relay to the lib-level bridge so axios interceptor sees the change.
          setCurrentTeamId(teamId);
          set({ teamId });
        },
      },
    })),
    { name: "TeamScopeStore" },
  ),
);

export const useTeamScope = () => useTeamScopeStore((s) => s.teamId);
export const useSetTeamScope = () =>
  useTeamScopeStore((s) => s.actions.setTeamScope);
