import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import type { OceanShipmentDetail } from "@/types";

type OpenState = { isOpen: true; shipment: OceanShipmentDetail };
type CloseState = { isOpen: false };
type State = CloseState | OpenState;

const initialState = { isOpen: false } as State;

const useOceanShipmentOrganizeModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: (shipment: OceanShipmentDetail) =>
          set({ isOpen: true, shipment }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "OceanShipmentOrganizeModalStore" },
  ),
);

export const useOpenOceanShipmentOrganizeModal = () =>
  useOceanShipmentOrganizeModalStore((s) => s.actions.open);

export const useOceanShipmentOrganizeModal = () => {
  const store = useOceanShipmentOrganizeModalStore();
  return store as typeof store & State;
};
