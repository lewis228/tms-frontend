import type { AppSession } from "@/types";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type State = {
  isLoaded: boolean;
  session: AppSession | null;
};

const initialState: State = { isLoaded: false, session: null };

const useSessionStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        setSession: (session: AppSession | null) => {
          set({ session, isLoaded: true });
        },
        markLoaded: () => set({ isLoaded: true }),
      },
    })),
    { name: "SessionStore" },
  ),
);

export const useSession = () => useSessionStore((s) => s.session);
export const useIsSessionLoaded = () => useSessionStore((s) => s.isLoaded);
export const useSetSession = () => useSessionStore((s) => s.actions.setSession);
export const useMarkSessionLoaded = () =>
  useSessionStore((s) => s.actions.markLoaded);
