// 한 leg 안에서 새 driver segment 추가 — 핸드오버.
// TERMINAL_CLOSED / ACCIDENT / SHIFT_CHANGE / OTHER 사유 선택.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateLegSegment } from "@/hooks/mutations/leg-segment/use-create-leg-segment";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { generateErrorMessage } from "@/lib/error";
import type { HandoverReason } from "@/types";

const REASONS: HandoverReason[] = [
  "TERMINAL_CLOSED",
  "ACCIDENT",
  "SHIFT_CHANGE",
  "OTHER",
];

export default function AddSegmentButton({
  legId,
  containerId,
}: {
  legId: number;
  containerId: number;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [driverId, setDriverId] = useState<string>("");
  const [reason, setReason] = useState<HandoverReason | "">("");
  const [startedAt, setStartedAt] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const { data: drivers } = useDriversData(1);

  const { mutate: createSegment, isPending } = useCreateLegSegment({
    onSuccess: () => {
      toast.success(t("container.segments.added"), { position: "top-center" });
      setOpen(false);
      setDriverId("");
      setReason("");
      setStartedAt("");
      setNote("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Handover
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Add Driver Segment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">New Driver</span>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">— select —</option>
                {(drivers?.items ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Handover Reason</span>
              <select
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value as HandoverReason | "")
                }
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">— none —</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Started At</span>
              <Input
                type="datetime-local"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                disabled={isPending}
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
                disabled={isPending || driverId === ""}
                onClick={() =>
                  createSegment({
                    legId,
                    containerId,
                    driverId: Number(driverId),
                    handoverReason: reason === "" ? null : reason,
                    startedAt: startedAt
                      ? new Date(startedAt).toISOString()
                      : null,
                    note: note || null,
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
