// 전역 모달 본체 마운트. ModalProvider 가 #modal-root 에 createPortal.
// Phase 2: alert 만. Profile / Member-invite 등은 Phase 7+ 에서 재추가.
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import AlertModal from "@/components/modal/alert-modal";
import ProfileModal from "@/components/modal/profile-modal";
import MemberInviteModal from "@/components/modal/member-invite-modal";
import ApiKeyCreateModal from "@/components/modal/api-key-create-modal";
import ApiKeyCreatedModal from "@/components/modal/api-key-created-modal";
import AIIntakeModal from "@/components/modal/ai-intake-modal";
import CustomerEditorModal from "@/components/customer/customer-editor-modal";
import DeliveryOrderCreateModal from "@/components/delivery-order/delivery-order-create-modal";
import DualTransactionCreateModal from "@/components/dual-transaction/dual-transaction-create-modal";
import DriverEditorModal from "@/components/driver/driver-editor-modal";
import DriverTempPasswordModal from "@/components/driver/driver-temp-password-modal";
import LegEditorModal from "@/components/leg/leg-editor-modal";
import LocationEditorModal from "@/components/location/location-editor-modal";
import SystemUserEditorModal from "@/components/system-user/system-user-editor-modal";
import TeamEditorModal from "@/components/team/team-editor-modal";
import TerminalEditorModal from "@/components/terminal/terminal-editor-modal";
import VesselEditorModal from "@/components/vessel/vessel-editor-modal";
import RateGroupEditorModal from "@/components/rate-group/rate-group-editor-modal";
import RatePointEditorModal from "@/components/rate-point/rate-point-editor-modal";
import RateZoneEditorModal from "@/components/rate-zone/rate-zone-editor-modal";
import RateSheetCreateModal from "@/components/rate-sheet/rate-sheet-create-modal";
import DriverRateAssignmentEditorModal from "@/components/driver-rate-assignment/driver-rate-assignment-editor-modal";
import InvoiceCreateModal from "@/components/invoice/invoice-create-modal";

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          {/* 시스템 */}
          <AlertModal />
          <ProfileModal />
          <MemberInviteModal />
          <ApiKeyCreateModal />
          <ApiKeyCreatedModal />
          {/* Master Data */}
          <VesselEditorModal />
          <TerminalEditorModal />
          <LocationEditorModal />
          <CustomerEditorModal />
          <DriverEditorModal />
          <DriverTempPasswordModal />
          {/* Rate management */}
          <RateGroupEditorModal />
          <RatePointEditorModal />
          <RateZoneEditorModal />
          <RateSheetCreateModal />
          <DriverRateAssignmentEditorModal />
          {/* Billing */}
          <InvoiceCreateModal />
          {/* Delivery Orders / Legs */}
          <DeliveryOrderCreateModal />
          <AIIntakeModal />
          <LegEditorModal />
          <DualTransactionCreateModal />
          {/* System (SUPER_ADMIN) */}
          <TeamEditorModal />
          <SystemUserEditorModal />
        </>,
        document.getElementById("modal-root")!,
      )}
      {children}
    </>
  );
}
