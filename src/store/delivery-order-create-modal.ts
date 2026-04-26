// D/O 생성 풀스크린 모달 — open/close + AI Intake prefill.
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { AIIntakeFields } from "@/api/ai-intake";

type State = {
  isOpen: boolean;
  // AI Intake 에서 추출된 prefill 값. 모달 mount 시 초기값에 사용.
  // 모달 닫히면 자동 클리어 (재오픈 시 빈 폼).
  prefill: AIIntakeFields | null;
};

const initialState: State = { isOpen: false, prefill: null };

const useDeliveryOrderCreateModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true, prefill: null }),
        openWithPrefill: (prefill: AIIntakeFields) =>
          set({ isOpen: true, prefill }),
        close: () => set({ isOpen: false, prefill: null }),
      },
    })),
    { name: "DeliveryOrderCreateModalStore" },
  ),
);

export const useOpenCreateDeliveryOrderModal = () =>
  useDeliveryOrderCreateModalStore((s) => s.actions.open);
export const useOpenCreateDeliveryOrderModalWithPrefill = () =>
  useDeliveryOrderCreateModalStore((s) => s.actions.openWithPrefill);
export const useDeliveryOrderCreateModal = () =>
  useDeliveryOrderCreateModalStore();
