import AlertModal from "@/components/modal/alert-modal";
import ApiKeyCreateModal from "@/components/modal/api-key-create-modal";
import ApiKeyCreatedModal from "@/components/modal/api-key-created-modal";
import MemberInviteModal from "@/components/modal/member-invite-modal";
import OceanShipmentOrganizeModal from "@/components/modal/ocean-shipment-organize-modal";
import ProfileModal from "@/components/modal/profile-modal";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          <AlertModal />
          <ProfileModal />
          <ApiKeyCreateModal />
          <ApiKeyCreatedModal />
          <MemberInviteModal />
          <OceanShipmentOrganizeModal />
        </>,
        document.getElementById("modal-root")!,
      )}
      {children}
    </>
  );
}
