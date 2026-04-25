import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

// Slide-in right-side panel that shows a single shipment's detail without
// leaving the current page. Opened from row clicks in the Containers page
// and the expanded-row container list on the Shipments page.
//
// It is orthogonal to `right-panel` (the resizable chat column) — the detail
// sidebar sits on a higher stacking layer and can appear on top of the chat
// panel. Open state lives here so any page/component can trigger it.

type State = {
  isOpen: boolean;
  shipmentId: number | null;
  // Raw container number (e.g. "CAIU4241250"). When set, the ContainersSection
  // auto-expands the matching card and scrolls it into view on mount.
  focusContainerNumber: string | null;
};

const initialState = {
  isOpen: false,
  shipmentId: null,
  focusContainerNumber: null,
} as State;

export const useOceanShipmentDetailSidebarStore = create(
  devtools(
    combine(initialState, (set) => ({
      open: (
        shipmentId: number,
        opts?: { focusContainerNumber?: string | null },
      ) =>
        set({
          isOpen: true,
          shipmentId,
          focusContainerNumber: opts?.focusContainerNumber ?? null,
        }),
      close: () =>
        set({
          isOpen: false,
          // Keep shipmentId for the exit animation; the panel clears it
          // after the transition finishes.
        }),
      reset: () => set(initialState),
    })),
    { name: "ocean-shipment-detail-sidebar" },
  ),
);

// Selector hooks — subscribers only re-render when their slice changes.

export const useOceanShipmentDetailSidebarIsOpen = () =>
  useOceanShipmentDetailSidebarStore((s) => s.isOpen);
export const useOceanShipmentDetailSidebarShipmentId = () =>
  useOceanShipmentDetailSidebarStore((s) => s.shipmentId);
export const useOceanShipmentDetailSidebarFocusContainer = () =>
  useOceanShipmentDetailSidebarStore((s) => s.focusContainerNumber);
export const useOpenOceanShipmentDetailSidebar = () =>
  useOceanShipmentDetailSidebarStore((s) => s.open);
export const useCloseOceanShipmentDetailSidebar = () =>
  useOceanShipmentDetailSidebarStore((s) => s.close);
export const useResetOceanShipmentDetailSidebar = () =>
  useOceanShipmentDetailSidebarStore((s) => s.reset);
