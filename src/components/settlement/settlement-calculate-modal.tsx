// PENDING/CALCULATED → CALCULATED. system_total + extras 입력.
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
import ExtrasEditor from "@/components/settlement/extras-editor";
import { useCalculateSettlement } from "@/hooks/mutations/settlement/use-calculate-settlement";
import { useSettlementByIdData } from "@/hooks/queries/use-settlement-by-id-data";
import { useSettlementExtrasData } from "@/hooks/queries/use-settlement-extras-data";
import { generateErrorMessage } from "@/lib/error";
import { useCalculateSettlementModal } from "@/store/settlement-action-modal";
import type { ExtraChargeInput } from "@/api/settlement";

export default function SettlementCalculateModal() {
  const modal = useCalculateSettlementModal();
  const { data: settlement } = useSettlementByIdData(
    modal.isOpen ? modal.settlementId : null,
  );
  const { data: extras } = useSettlementExtrasData(
    modal.isOpen ? modal.settlementId : null,
  );

  const [systemTotal, setSystemTotal] = useState("");
  const [rows, setRows] = useState<ExtraChargeInput[]>([]);

  useEffect(() => {
    if (!modal.isOpen) return;
    setSystemTotal(settlement?.systemTotal ?? "0");
    setRows(
      (extras ?? []).map((e) => ({
        type: e.type,
        amount: e.amount,
        description: e.description,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen, settlement?.id, extras?.length]);

  const { mutate, isPending } = useCalculateSettlement({
    onSuccess: () => {
      toast.success("Settlement 가 계산되었습니다.", {
        position: "top-center",
      });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSave = () => {
    if (!systemTotal.trim()) return;
    mutate({
      id: modal.settlementId,
      payload: {
        systemTotal: systemTotal.trim(),
        extraCharges: rows.filter((r) => r.type.trim() !== ""),
      },
    });
  };

  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sans">Calculate Settlement</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              System Total <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={systemTotal}
              onChange={(e) => setSystemTotal(e.target.value)}
              disabled={isPending}
              className="text-right"
            />
          </div>
          <ExtrasEditor rows={rows} setRows={setRows} disabled={isPending} />
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
            {isPending ? "계산중..." : "계산"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
