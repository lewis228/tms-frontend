import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

// Remembers where the user was trying to go before hitting a guard redirect.
// Consumed (and cleared) by sign-in mutations on success. Not persisted —
// survives only within a single browser tab.

type State = {
  path: string | null;
};

const initialState: State = { path: null };

const useRedirectStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        setRedirect: (path: string | null) => set({ path }),
        // Atomic read+clear so concurrent callers don't re-consume the same path.
        consumeRedirect: () => {
          let captured: string | null = null;
          set((s) => {
            captured = s.path;
            return { path: null };
          });
          return captured;
        },
      },
    })),
    { name: "RedirectStore" },
  ),
);

export const useSetRedirect = () => useRedirectStore((s) => s.actions.setRedirect);
export const useConsumeRedirect = () =>
  useRedirectStore((s) => s.actions.consumeRedirect);
