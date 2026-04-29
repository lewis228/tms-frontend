// LegRate base_amount 수동 override + payee_driver 변경 + 명시적 재계산.
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateLegRate } from "@/hooks/mutations/leg-rate/use-update-leg-rate";
import { recalculateLegRate } from "@/api/leg-rate";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { generateErrorMessage } from "@/lib/error";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import type { LegRateEntity } from "@/types";

export default function EditLegRateButton({
  legId,
  containerId,
  rate,
}: {
  legId: number;
  containerId: number;
  rate: LegRateEntity | null;
}) {
  const [open, setOpen] = useState(false);
  const [baseAmount, setBaseAmount] = useState<string>(
    rate?.baseAmount ?? "0",
  );
  const [payeeDriverId, setPayeeDriverId] = useState<string>(
    rate?.payeeDriverId ? String(rate.payeeDriverId) : "",
  );
  const [note, setNote] = useState<string>(rate?.note ?? "");
  const [isRecalcPending, setIsRecalcPending] = useState(false);

  const qc = useQueryClient();
  const { data: drivers } = useDriversData(1);

  const { mutate: updateRate, isPending: isUpdatePending } = useUpdateLegRate({
    onSuccess: () => {
      toast.success("Rate 저장됨", { position: "top-center" });
      setOpen(false);
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleRecalc = async () => {
    setIsRecalcPending(true);
    try {
      const next = await recalculateLegRate(legId);
      setBaseAmount(next.baseAmount);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legRate.byLeg(legId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.containerV3.full(containerId) });
      toast.success("재계산 완료", { position: "top-center" });
    } catch (err) {
      toast.error(generateErrorMessage(err), { position: "top-center" });
    } finally {
      setIsRecalcPending(false);
    }
  };

  const isPending = isUpdatePending || isRecalcPending;

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Edit Rate
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Edit Leg Rate</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Base Amount (override)</span>
              <Input
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                disabled={isPending}
                inputMode="decimal"
              />
              <span className="text-[10px] text-muted-foreground">
                직접 입력하면 manual_override=true 로 동결됨. 마스터 변경에 영향 안 받음.
              </span>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Payee Driver</span>
              <select
                value={payeeDriverId}
                onChange={(e) => setPayeeDriverId(e.target.value)}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">— none —</option>
                {(drivers?.items ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Note</span>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isPending}
              />
            </label>
            <div className="col-span-2 flex justify-between gap-2">
              <Button
                variant="outline"
                disabled={isPending}
                onClick={handleRecalc}
              >
                ⟳ 재계산 (마스터 현재 값으로)
              </Button>
              <Button
                disabled={isPending}
                onClick={() =>
                  updateRate({
                    legId,
                    containerId,
                    payload: {
                      baseAmount: baseAmount === "" ? null : Number(baseAmount),
                      payeeDriverId:
                        payeeDriverId === "" ? null : Number(payeeDriverId),
                      note: note || null,
                    },
                  })
                }
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
