// 임시 비밀번호 1회 노출 모달.
// 닫기 시도 시 AlertModal 로 한 번 더 confirm — 닫으면 영구히 못 봄.
import { useState } from "react";
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
      toast.success("임시 비밀번호가 복사되었습니다.", {
        position: "top-center",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다. 수동으로 선택해 복사해 주세요.", {
        position: "top-center",
      });
    }
  };

  const tryClose = () => {
    openAlert({
      title: "이 비밀번호를 어디에 저장하셨습니까?",
      description:
        "이 창을 닫으면 임시 비밀번호를 다시 볼 수 없습니다. 안전한 곳에 저장하셨다면 확인을 누르세요.",
      onPositive: () => modal.actions.close(),
    });
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && tryClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            임시 비밀번호 발급 (1회 노출)
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            ⚠️ <b>이 화면을 닫으면 다시 볼 수 없습니다.</b> 기사에게 안전한 채널로
            전달하고 첫 로그인 시 변경하도록 안내하세요.
          </div>
          <div>
            <span className="text-muted-foreground">기사:</span>{" "}
            <b>{modal.driverName}</b>{" "}
            <span className="text-muted-foreground">({modal.email})</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 select-all rounded-md border bg-muted px-3 py-2 font-mono text-base">
              {modal.tempPassword}
            </code>
            <Button onClick={handleCopy} variant="outline">
              {copied ? "복사됨" : "복사"}
            </Button>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={tryClose}>저장 완료, 닫기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
