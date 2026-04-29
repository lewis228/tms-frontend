// Leg Card 안에서 LegCharge 추가. ChargeCode 선택 → quantity 스피너.
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
import { useCreateLegCharge } from "@/hooks/mutations/leg-charge/use-create-leg-charge";
import { useChargeCodesData } from "@/hooks/queries/use-charge-codes-data";
import { generateErrorMessage } from "@/lib/error";

export default function AddLegChargeButton({
  legId,
  containerId,
}: {
  legId: number;
  containerId: number;
}) {
  const [open, setOpen] = useState(false);
  const [chargeCodeId, setChargeCodeId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [override, setOverride] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const _cid = containerId;

  const { data: codesData } = useChargeCodesData(1);
  const codes = codesData?.items ?? [];

  const { mutate: createCharge, isPending } = useCreateLegCharge({
    onSuccess: () => {
      toast.success("Charge 추가됨", { position: "top-center" });
      setOpen(false);
      setChargeCodeId("");
      setQuantity("1");
      setOverride("");
      setNote("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const selected = codes.find((c) => String(c.id) === chargeCodeId);
  const _ = _cid;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Charge
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Add Charge</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Charge Code</span>
              <select
                value={chargeCodeId}
                onChange={(e) => {
                  setChargeCodeId(e.target.value);
                  setOverride("");
                }}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">— select —</option>
                {codes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    setQuantity((q) => String(Math.max(0, Number(q) - 1)))
                  }
                >
                  −
                </Button>
                <Input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={isPending}
                  inputMode="decimal"
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setQuantity((q) => String(Number(q) + 1))}
                >
                  +
                </Button>
              </div>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                Unit Amount{" "}
                {selected?.defaultAmount && (
                  <span className="font-mono text-muted-foreground">
                    (default {selected.defaultAmount})
                  </span>
                )}
              </span>
              <Input
                value={override}
                onChange={(e) => setOverride(e.target.value)}
                placeholder="default"
                disabled={isPending}
                inputMode="decimal"
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Note</span>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isPending}
              />
            </label>
            <div className="col-span-2 flex justify-end">
              <Button
                disabled={isPending || chargeCodeId === ""}
                onClick={() =>
                  createCharge({
                    legId,
                    chargeCodeId: Number(chargeCodeId),
                    quantity: Number(quantity) || 1,
                    snapshotUnitAmount: override === "" ? null : Number(override),
                    description: note || null,
                  } as Parameters<typeof createCharge>[0])
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
