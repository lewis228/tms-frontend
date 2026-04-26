// AI Intake 모달 store — 단순 open/close.
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const initial = { isOpen: false };

const useAIIntakeModalStore = create(
  devtools(
    combine(initial, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "AIIntakeModalStore" },
  ),
);

export const useOpenAIIntakeModal = () =>
  useAIIntakeModalStore((s) => s.actions.open);
export const useAIIntakeModal = () => useAIIntakeModalStore();
