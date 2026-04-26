// CALCULATED/ADJUSTED → APPROVED. final_amount + note 옵션.
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
import { useApproveSettlement } from "@/hooks/mutations/settlement/use-approve-settlement";
import { useSettlementByIdData } from "@/hooks/queries/use-settlement-by-id-data";
import { generateErrorMessage } from "@/lib/error";
import { useApproveSettlementModal } from "@/store/settlement-action-modal";

type Modal = ReturnType<typeof useApproveSettlementModal>;
type SettlementData = NonNullable<
  ReturnType<typeof useSettlementByIdData>["data"]
>;

export default function SettlementApproveModal() {
  const { t } = useTranslation();
  const modal = useApproveSettlementModal();
  const { data: settlement } = useSettlementByIdData(
    modal.isOpen ? modal.settlementId : null,
  );

  const ready = modal.isOpen && settlement !== undefined;

  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            {t("settlement.approve.title")}
          </DialogTitle>
        </DialogHeader>
        {ready ? (
          <Body key={settlement.id} modal={modal} settlement={settlement} />
        ) : modal.isOpen ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Body({
  modal,
  settlement,
}: {
  modal: Modal;
  settlement: SettlementData;
}) {
  const { t } = useTranslation();
  const [finalAmount, setFinalAmount] = useState(
    settlement.finalAmount ?? settlement.systemTotal ?? "",
  );
  const [note, setNote] = useState(settlement.note ?? "");

  const { mutate, isPending } = useApproveSettlement({
    onSuccess: () => {
      toast.success(t("settlement.approve.success"), {
        position: "top-center",
      });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSave = () => {
    mutate({
      id: modal.settlementId!,
      payload: {
        finalAmount: finalAmount.trim() || null,
        note: note.trim() || null,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {t("settlement.approve.warning")}
      </p>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">
          {t("settlement.detail.finalAmountLabel")}
        </label>
        <Input
          type="number"
          step="0.01"
          value={finalAmount}
          onChange={(e) => setFinalAmount(e.target.value)}
          disabled={isPending}
          className="text-right"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">
          {t("settlement.detail.noteField")}
        </label>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isPending}
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
        <Button onClick={handleSave} disabled={isPending}>
          {isPending
            ? t("settlement.approve.submitting")
            : t("settlement.approve.submit")}
        </Button>
      </div>
    </div>
  );
}
