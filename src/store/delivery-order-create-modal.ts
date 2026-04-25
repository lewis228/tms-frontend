// D/O 생성 풀스크린 모달 — open/close 만. 폼 상태는 컴포넌트가 자체 관리.
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type State = { isOpen: boolean };

const initialState: State = { isOpen: false };

const useDeliveryOrderCreateModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "DeliveryOrderCreateModalStore" },
  ),
);

export const useOpenCreateDeliveryOrderModal = () =>
  useDeliveryOrderCreateModalStore((s) => s.actions.open);
export const useDeliveryOrderCreateModal = () =>
  useDeliveryOrderCreateModalStore();
