// 임시 비밀번호 1회 노출 모달.
// 닫기 시도 시 AlertModal 로 한 번 더 confirm — 닫으면 영구히 못 봄.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useDriverTempPasswordModal } from "@/store/driver-temp-password-modal";

export default function DriverTempPasswordModal() {
  const { t } = useTranslation();
  const modal = useDriverTempPasswordModal();
  const openAlert = useOpenAlertModal();
  const [copied, setCopied] = useState(false);

  if (!modal.isOpen) {
    return <Dialog open={false}><DialogContent /></Dialog>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(modal.tempPassword);
      setCopied(true);
      toast.success(t("driver.tempPassword.copyToastSuccess"), {
        position: "top-center",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("driver.tempPassword.copyToastFail"), {
        position: "top-center",
      });
    }
  };

  const tryClose = () => {
    openAlert({
      title: t("driver.tempPassword.confirmCloseTitle"),
      description: t("driver.tempPassword.confirmCloseDesc"),
      onPositive: () => modal.actions.close(),
    });
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && tryClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            {t("driver.tempPassword.modalTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            {t("driver.tempPassword.warning")}
          </div>
          <div>
            <span className="text-muted-foreground">
              {t("driver.tempPassword.driverLabel")}
            </span>{" "}
            <b>{modal.driverName}</b>{" "}
            <span className="text-muted-foreground">({modal.email})</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 select-all rounded-md border bg-muted px-3 py-2 font-mono text-base">
              {modal.tempPassword}
            </code>
            <Button onClick={handleCopy} variant="outline">
              {copied
                ? t("driver.tempPassword.copied")
                : t("driver.tempPassword.copy")}
            </Button>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={tryClose}>
            {t("driver.tempPassword.closeButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
