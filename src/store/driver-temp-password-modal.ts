// 임시 비밀번호 1회 노출 모달.
// 한번 닫으면 재현 불가 — 닫기 전에 AlertModal 로 한 번 더 confirm.
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type OpenState = {
  isOpen: true;
  email: string;
  driverName: string;
  tempPassword: string;
};
type CloseState = { isOpen: false };
type State = CloseState | OpenState;

const initialState = { isOpen: false } as State;

const useDriverTempPasswordModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: (params: Omit<OpenState, "isOpen">) =>
          set({ isOpen: true, ...params }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "DriverTempPasswordModalStore" },
  ),
);

export const useOpenDriverTempPasswordModal = () =>
  useDriverTempPasswordModalStore((s) => s.actions.open);
export const useDriverTempPasswordModal = () => {
  const store = useDriverTempPasswordModalStore();
  return store as typeof store & State;
};
