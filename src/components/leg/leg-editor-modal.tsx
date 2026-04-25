// Leg 생성/수정 모달.
//
// 생성: D/O id 고정. step / move_type / service_type / driver / pickup·delivery location & date / note
// 수정: deliveryOrderId 변경 불가 (서버도 안 받음). status 변경은 transition 별도.
//
// 백엔드 game: D/O PLANNING→DISPATCHED 게이트 충족하려면 first leg 가 driver_id + pickup_date 필요.
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
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { useCreateLeg } from "@/hooks/mutations/leg/use-create-leg";
import { useUpdateLeg } from "@/hooks/mutations/leg/use-update-leg";
import { generateErrorMessage } from "@/lib/error";
import { useLegEditorModal } from "@/store/leg-editor-modal";
import type { DeliveryStatus, MoveType, ServiceType } from "@/types";

const STEPS: DeliveryStatus[] = [
  "DISPATCHED",
  "YARD_STAGED",
  "FINAL_DELIVERY",
  "EMPTY_STAGED",
  "COMPLETED",
];
const MOVE_TYPES: MoveType[] = ["LOADED", "EMPTY"];
const SERVICE_TYPES: ServiceType[] = ["LIVE", "DROP"];

export default function LegEditorModal() {
  const modal = useLegEditorModal();

  const [step, setStep] = useState<DeliveryStatus>("DISPATCHED");
  const [moveType, setMoveType] = useState<MoveType>("LOADED");
  const [serviceType, setServiceType] = useState<ServiceType>("DROP");
  const [driverId, setDriverId] = useState("");
  const [pickupLocationId, setPickupLocationId] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [deliveryLocationId, setDeliveryLocationId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");

  const { data: driversData } = useDriversData(1);
  const { data: locationsData } = useLocationsData(1);

  useEffect(() => {
    if (!modal.isOpen) return;
    if (modal.type === "CREATE") {
      setStep("DISPATCHED");
      setMoveType("LOADED");
      setServiceType("DROP");
      setDriverId("");
      setPickupLocationId("");
      setPickupDate("");
      setDeliveryLocationId("");
      setDeliveryDate("");
      setNote("");
    } else {
      const l = modal.leg;
      setStep(l.step);
      setMoveType(l.moveType);
      setServiceType(l.serviceType);
      setDriverId(l.driverId ?? "");
      setPickupLocationId(l.pickupLocationId ?? "");
      setPickupDate(toLocalInput(l.pickupDate));
      setDeliveryLocationId(l.deliveryLocationId ?? "");
      setDeliveryDate(toLocalInput(l.deliveryDate));
      setNote(l.note ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen]);

  const { mutate: createLeg, isPending: isCreatePending } = useCreateLeg({
    onSuccess: () => {
      toast.success("Leg 가 생성되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateLeg, isPending: isUpdatePending } = useUpdateLeg({
    onSuccess: () => {
      toast.success("Leg 가 수정되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isUpdatePending;

  const handleSave = () => {
    if (!modal.isOpen) return;
    const payload = {
      step,
      moveType,
      serviceType,
      driverId: driverId || null,
      pickupLocationId: pickupLocationId || null,
      pickupDate: toIsoOrNull(pickupDate),
      deliveryLocationId: deliveryLocationId || null,
      deliveryDate: toIsoOrNull(deliveryDate),
      note: note.trim() || null,
    };
    if (modal.type === "CREATE") {
      createLeg({ deliveryOrderId: modal.deliveryOrderId, ...payload });
    } else {
      updateLeg({ id: modal.leg.id, payload });
    }
  };

  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {modal.isOpen && modal.type === "CREATE" ? "Leg 생성" : "Leg 수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Step (D/O 단계)" required>
            <select
              value={step}
              onChange={(e) => setStep(e.target.value as DeliveryStatus)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              {STEPS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Move Type" required>
            <select
              value={moveType}
              onChange={(e) => setMoveType(e.target.value as MoveType)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              {MOVE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Service Type" required>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Driver">
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">— 미지정 —</option>
              {(driversData?.items ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.email})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Pickup Location">
            <select
              value={pickupLocationId}
              onChange={(e) => setPickupLocationId(e.target.value)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {(locationsData?.items ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.kind})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Pickup Date">
            <Input
              type="datetime-local"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label="Delivery Location">
            <select
              value={deliveryLocationId}
              onChange={(e) => setDeliveryLocationId(e.target.value)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {(locationsData?.items ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.kind})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Delivery Date">
            <Input
              type="datetime-local"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <div className="col-span-2">
            <Field label="메모">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isPending}
              />
            </Field>
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
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // datetime-local input 은 yyyy-MM-ddTHH:mm 포맷.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoOrNull(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
