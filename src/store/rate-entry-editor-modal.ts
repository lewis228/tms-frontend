import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type {
  RateMethod,
  RateMoveType,
  RateServiceType,
  RateContainerSize,
} from "@/types";

// 요율 셀(플랫 행) 추가 모달 — 그룹 단위. 매트릭스 셀 클릭/New 버튼에서 프리셋 전달.
type OpenCreate = {
  isOpen: true;
  type: "CREATE";
  groupId: number;
  method: RateMethod;
  presetMove?: RateMoveType;
  presetService?: RateServiceType;
  presetSize?: RateContainerSize;
  presetFromZoneId?: number;
  presetToZoneId?: number;
  presetFromCity?: string;
  presetFromState?: string;
  presetToCity?: string;
  presetToState?: string;
};
type CloseState = { isOpen: false };
type State = CloseState | OpenCreate;

const initialState = { isOpen: false } as State;

const useRateEntryEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: (payload: Omit<OpenCreate, "isOpen" | "type">) =>
          set({ isOpen: true, type: "CREATE", ...payload }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "RateEntryEditorModalStore" },
  ),
);

export const useOpenCreateRateEntryModal = () =>
  useRateEntryEditorModalStore((s) => s.actions.openCreate);
export const useRateEntryEditorModal = () => {
  const store = useRateEntryEditorModalStore();
  return store as typeof store & State;
};
