// 전역 모달 본체 마운트. ModalProvider 가 #modal-root 에 createPortal.
// Phase 2: alert 만. Profile / Member-invite 등은 Phase 7+ 에서 재추가.
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import AlertModal from "@/components/modal/alert-modal";
import CustomerEditorModal from "@/components/customer/customer-editor-modal";
import DeliveryOrderCreateModal from "@/components/delivery-order/delivery-order-create-modal";
import DriverEditorModal from "@/components/driver/driver-editor-modal";
import DriverTempPasswordModal from "@/components/driver/driver-temp-password-modal";
import LegEditorModal from "@/components/leg/leg-editor-modal";
import LocationEditorModal from "@/components/location/location-editor-modal";
import TerminalEditorModal from "@/components/terminal/terminal-editor-modal";
import VesselEditorModal from "@/components/vessel/vessel-editor-modal";

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          {/* 시스템 */}
          <AlertModal />
          {/* Master Data */}
          <VesselEditorModal />
          <TerminalEditorModal />
          <LocationEditorModal />
          <CustomerEditorModal />
          <DriverEditorModal />
          <DriverTempPasswordModal />
          {/* Delivery Orders / Legs */}
          <DeliveryOrderCreateModal />
          <LegEditorModal />
        </>,
        document.getElementById("modal-root")!,
      )}
      {children}
    </>
  );
}
