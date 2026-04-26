// Settlement 액션 모달들 — calculate / adjust / approve / unapprove.
// 각 모달이 자기 store. open 시 settlementId 만 받음 (폼 상태는 컴포넌트 내부).
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type State = { isOpen: boolean; settlementId: number | null };

const initial: State = { isOpen: false, settlementId: null };

function makeStore(name: string) {
  return create(
    devtools(
      combine(initial, (set) => ({
        actions: {
          open: (settlementId: number) =>
            set({ isOpen: true, settlementId }),
          close: () => set({ isOpen: false, settlementId: null }),
        },
      })),
      { name },
    ),
  );
}

const useCalculateStore = makeStore("SettlementCalculateModalStore");
const useAdjustStore = makeStore("SettlementAdjustModalStore");
const useApproveStore = makeStore("SettlementApproveModalStore");
const useUnapproveStore = makeStore("SettlementUnapproveModalStore");

export const useOpenCalculateSettlement = () =>
  useCalculateStore((s) => s.actions.open);
export const useCalculateSettlementModal = () => useCalculateStore();

export const useOpenAdjustSettlement = () =>
  useAdjustStore((s) => s.actions.open);
export const useAdjustSettlementModal = () => useAdjustStore();

export const useOpenApproveSettlement = () =>
  useApproveStore((s) => s.actions.open);
export const useApproveSettlementModal = () => useApproveStore();

export const useOpenUnapproveSettlement = () =>
  useUnapproveStore((s) => s.actions.open);
export const useUnapproveSettlementModal = () => useUnapproveStore();
