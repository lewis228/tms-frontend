// CALCULATED/ADJUSTED → APPROVED. final_amount + note 옵션.
import { useEffect, useState } from "react";
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

export default function SettlementApproveModal() {
  const modal = useApproveSettlementModal();
  const { data: settlement } = useSettlementByIdData(
    modal.isOpen ? modal.settlementId : null,
  );

  const [finalAmount, setFinalAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!modal.isOpen) return;
    setFinalAmount(settlement?.finalAmount ?? settlement?.systemTotal ?? "");
    setNote(settlement?.note ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen, settlement?.id]);

  const { mutate, isPending } = useApproveSettlement({
    onSuccess: () => {
      toast.success("Settlement 가 승인되었습니다.", {
        position: "top-center",
      });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSave = () => {
    mutate({
      id: modal.settlementId,
      payload: {
        finalAmount: finalAmount.trim() || null,
        note: note.trim() || null,
      },
    });
  };

  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">Approve Settlement</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            ⚠ 승인 후엔 모든 금액 필드가 잠깁니다 (Adjust 불가). Unapprove 는
            ADMIN+ 권한 + 사유 필수.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Final Amount
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
            <label className="text-xs text-muted-foreground">Note</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => modal.actions.close()}
            disabled={isPending}
          >
            취소
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "승인중..." : "승인"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
