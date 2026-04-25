// 전역 모달 본체 마운트. ModalProvider 가 #modal-root 에 createPortal.
// Phase 2: alert 만. Profile / Member-invite 등은 Phase 7+ 에서 재추가.
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import AlertModal from "@/components/modal/alert-modal";
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
        </>,
        document.getElementById("modal-root")!,
      )}
      {children}
    </>
  );
}
