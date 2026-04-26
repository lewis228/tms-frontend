// PENDING/CALCULATED → CALCULATED. system_total + extras 입력.
import { useState } from "react";
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
import type { ExtraChargeEntity } from "@/types";

type Modal = ReturnType<typeof useCalculateSettlementModal>;
type SettlementData = NonNullable<
  ReturnType<typeof useSettlementByIdData>["data"]
>;

export default function SettlementCalculateModal() {
  const modal = useCalculateSettlementModal();
  const { data: settlement } = useSettlementByIdData(
    modal.isOpen ? modal.settlementId : null,
  );
  const { data: extras } = useSettlementExtrasData(
    modal.isOpen ? modal.settlementId : null,
  );

  const ready = modal.isOpen && settlement !== undefined && extras !== undefined;

  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sans">Calculate Settlement</DialogTitle>
        </DialogHeader>
        {ready ? (
          <Body
            key={settlement.id}
            modal={modal}
            settlement={settlement}
            extras={extras}
          />
        ) : modal.isOpen ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            로딩 중...
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Body({
  modal,
  settlement,
  extras,
}: {
  modal: Modal;
  settlement: SettlementData;
  extras: ExtraChargeEntity[];
}) {
  const [systemTotal, setSystemTotal] = useState(settlement.systemTotal ?? "0");
  const [rows, setRows] = useState<ExtraChargeInput[]>(
    extras.map((e) => ({
      type: e.type,
      amount: e.amount,
      description: e.description,
    })),
  );

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
      id: modal.settlementId!,
      payload: {
        systemTotal: systemTotal.trim(),
        extraCharges: rows.filter((r) => r.type.trim() !== ""),
      },
    });
  };

  return (
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
    </div>
  );
}
