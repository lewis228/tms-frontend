// CALCULATED/ADJUSTED → ADJUSTED. note 필수, has_flag 자동/수동, extras 재정의.
import { useEffect, useMemo, useState } from "react";
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
import { useAdjustSettlement } from "@/hooks/mutations/settlement/use-adjust-settlement";
import { useSettlementByIdData } from "@/hooks/queries/use-settlement-by-id-data";
import { useSettlementExtrasData } from "@/hooks/queries/use-settlement-extras-data";
import { generateErrorMessage } from "@/lib/error";
import { useAdjustSettlementModal } from "@/store/settlement-action-modal";
import type { ExtraChargeInput } from "@/api/settlement";

export default function SettlementAdjustModal() {
  const modal = useAdjustSettlementModal();
  const { data: settlement } = useSettlementByIdData(
    modal.isOpen ? modal.settlementId : null,
  );
  const { data: extras } = useSettlementExtrasData(
    modal.isOpen ? modal.settlementId : null,
  );

  const [finalAmount, setFinalAmount] = useState("");
  const [driverReported, setDriverReported] = useState("");
  const [note, setNote] = useState("");
  const [hasFlagOverride, setHasFlagOverride] = useState<boolean | null>(null);
  const [rows, setRows] = useState<ExtraChargeInput[]>([]);

  useEffect(() => {
    if (!modal.isOpen) return;
    setFinalAmount(settlement?.finalAmount ?? settlement?.systemTotal ?? "");
    setDriverReported(settlement?.driverReportedAmount ?? "");
    setNote("");
    setHasFlagOverride(null);
    setRows(
      (extras ?? []).map((e) => ({
        type: e.type,
        amount: e.amount,
        description: e.description,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen, settlement?.id, extras?.length]);

  // discrepancy 자동 계산.
  const discrepancy = useMemo(() => {
    const dr = Number(driverReported);
    const sys = Number(settlement?.systemTotal ?? 0);
    if (!Number.isFinite(dr) || !driverReported) return null;
    return dr - sys;
  }, [driverReported, settlement?.systemTotal]);

  const recommendedFlag = discrepancy !== null && discrepancy !== 0;
  const hasFlag = hasFlagOverride ?? recommendedFlag;

  const { mutate, isPending } = useAdjustSettlement({
    onSuccess: () => {
      toast.success("Settlement 가 조정되었습니다.", {
        position: "top-center",
      });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSave = () => {
    if (!note.trim()) {
      toast.error("조정 사유 (note) 를 입력하세요.", {
        position: "top-center",
      });
      return;
    }
    mutate({
      id: modal.settlementId,
      payload: {
        finalAmount: finalAmount.trim() || null,
        driverReportedAmount: driverReported.trim() || null,
        hasFlag,
        note: note.trim(),
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
          <DialogTitle className="font-sans">Adjust Settlement</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                System Total (참조)
              </label>
              <Input
                value={settlement?.systemTotal ?? ""}
                disabled
                className="text-right"
              />
            </div>
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
              <label className="text-xs text-muted-foreground">
                Driver Reported
              </label>
              <Input
                type="number"
                step="0.01"
                value={driverReported}
                onChange={(e) => setDriverReported(e.target.value)}
                disabled={isPending}
                className="text-right"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Discrepancy (자동)
              </label>
              <Input
                value={
                  discrepancy === null ? "" : discrepancy.toFixed(2)
                }
                disabled
                className={
                  "text-right " +
                  (discrepancy !== null && discrepancy !== 0
                    ? "border-amber-300"
                    : "")
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <input
              id="hasFlag"
              type="checkbox"
              checked={hasFlag}
              onChange={(e) => setHasFlagOverride(e.target.checked)}
              disabled={isPending}
            />
            <label htmlFor="hasFlag" className="flex-1">
              Has Flag
              {recommendedFlag && hasFlagOverride === null && (
                <span className="ml-2 text-xs text-amber-600">
                  (discrepancy ≠ 0 — 자동 추천됨)
                </span>
              )}
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Note <span className="text-destructive">*</span>
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
              placeholder="조정 사유"
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
          <Button
            onClick={handleSave}
            disabled={isPending || !note.trim()}
          >
            {isPending ? "조정중..." : "조정"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
