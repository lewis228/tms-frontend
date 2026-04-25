import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";

// Team-scoped company profile info (legal business name, registration
// number, address, etc.) used for invoicing and customs paperwork. Not yet
// on the backend — stored per-team in localStorage so the form keeps state
// across reloads while we design the persistence layer. Move to
// `PATCH /team` fields once the backend column lands.

export type CompanyInfo = {
  businessName: string;
  registrationNumber: string;
  address: string;
  representative: string;
  phone: string;
};

export const EMPTY_COMPANY_INFO: CompanyInfo = {
  businessName: "",
  registrationNumber: "",
  address: "",
  representative: "",
  phone: "",
};

type State = {
  byTeam: Record<number, CompanyInfo>;
};

const initialState: State = { byTeam: {} };

const useTeamCompanyInfoStore = create(
  devtools(
    persist(
      combine(initialState, (set, get) => ({
        actions: {
          set: (teamId: number, info: CompanyInfo) =>
            set({ byTeam: { ...get().byTeam, [teamId]: info } }),
          clear: (teamId: number) => {
            const next = { ...get().byTeam };
            delete next[teamId];
            set({ byTeam: next });
          },
        },
      })),
      {
        name: "team-company-info",
        partialize: (store) => ({ byTeam: store.byTeam }),
      },
    ),
    { name: "TeamCompanyInfoStore" },
  ),
);

export const useTeamCompanyInfo = (teamId: number | undefined): CompanyInfo => {
  const map = useTeamCompanyInfoStore((s) => s.byTeam);
  if (teamId === undefined) return EMPTY_COMPANY_INFO;
  return map[teamId] ?? EMPTY_COMPANY_INFO;
};

export const useSetTeamCompanyInfo = () =>
  useTeamCompanyInfoStore((s) => s.actions.set);
