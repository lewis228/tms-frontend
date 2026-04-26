// APPROVED → ADJUSTED. ADMIN+. reason 필수.
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
import { Input } from "@/components/ui/input";
import { useUnapproveSettlement } from "@/hooks/mutations/settlement/use-unapprove-settlement";
import { generateErrorMessage } from "@/lib/error";
import { useUnapproveSettlementModal } from "@/store/settlement-action-modal";

type Modal = ReturnType<typeof useUnapproveSettlementModal>;

export default function SettlementUnapproveModal() {
  const { t } = useTranslation();
  const modal = useUnapproveSettlementModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            {t("settlement.unapprove.title")}
          </DialogTitle>
        </DialogHeader>
        {modal.isOpen && <Body modal={modal} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: Modal }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  const { mutate, isPending } = useUnapproveSettlement({
    onSuccess: () => {
      toast.success(t("settlement.unapprove.success"), {
        position: "top-center",
      });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSave = () => {
    if (!reason.trim()) return;
    mutate({
      id: modal.settlementId!,
      payload: { reason: reason.trim() },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
        {t("settlement.unapprove.warning")}
      </p>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">
          {t("settlement.detail.reasonField")}{" "}
          <span className="text-destructive">*</span>
        </label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isPending}
          placeholder={t("settlement.unapprove.reasonPlaceholder")}
          maxLength={500}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => modal.actions.close()}
          disabled={isPending}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending || !reason.trim()}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isPending
            ? t("settlement.unapprove.submitting")
            : t("settlement.unapprove.submit")}
        </Button>
      </div>
    </div>
  );
}
