// Leg 생성/수정 모달.
//
// 생성: D/O id 고정. step / move_type / service_type / driver / pickup·delivery location & date / note
// 수정: deliveryOrderId 변경 불가 (서버도 안 받음). status 변경은 transition 별도.
//
// 백엔드 game: D/O PLANNING→DISPATCHED 게이트 충족하려면 first leg 가 driver_id + pickup_date 필요.
import { useState } from "react";
import { toast } from "sonner";

import { fetchDriver, fetchDrivers } from "@/api/driver";
import { fetchLocation, fetchLocations } from "@/api/location";
import SearchableSelect from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateLeg } from "@/hooks/mutations/leg/use-create-leg";
import { useUpdateLeg } from "@/hooks/mutations/leg/use-update-leg";
import { generateErrorMessage } from "@/lib/error";
import { useLegEditorModal } from "@/store/leg-editor-modal";
import type {
  DeliveryStatus,
  DriverEntity,
  LocationEntity,
  MoveType,
  ServiceType,
} from "@/types";

const SEARCH_SIZE = 50;

const STEPS: DeliveryStatus[] = [
  "DISPATCHED",
  "YARD_STAGED",
  "FINAL_DELIVERY",
  "EMPTY_STAGED",
  "COMPLETED",
];
const MOVE_TYPES: MoveType[] = ["LOADED", "EMPTY"];
const SERVICE_TYPES: ServiceType[] = ["LIVE", "DROP"];

type OpenModal = Extract<
  ReturnType<typeof useLegEditorModal>,
  { isOpen: true }
>;

export default function LegEditorModal() {
  const modal = useLegEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.leg.id}` : "c"}
            modal={modal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: OpenModal }) {
  const [step, setStep] = useState<DeliveryStatus>(
    modal.type === "CREATE" ? "DISPATCHED" : modal.leg.step,
  );
  const [moveType, setMoveType] = useState<MoveType>(
    modal.type === "CREATE" ? "LOADED" : modal.leg.moveType,
  );
  const [serviceType, setServiceType] = useState<ServiceType>(
    modal.type === "CREATE" ? "DROP" : modal.leg.serviceType,
  );
  const [driverId, setDriverId] = useState<number | null>(
    modal.type === "CREATE" ? null : (modal.leg.driverId ?? null),
  );
  const [pickupLocationId, setPickupLocationId] = useState<number | null>(
    modal.type === "CREATE" ? null : (modal.leg.pickupLocationId ?? null),
  );
  const [pickupDate, setPickupDate] = useState(
    modal.type === "CREATE" ? "" : toLocalInput(modal.leg.pickupDate),
  );
  const [deliveryLocationId, setDeliveryLocationId] = useState<number | null>(
    modal.type === "CREATE" ? null : (modal.leg.deliveryLocationId ?? null),
  );
  const [deliveryDate, setDeliveryDate] = useState(
    modal.type === "CREATE" ? "" : toLocalInput(modal.leg.deliveryDate),
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.leg.note ?? ""),
  );

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
    const payload = {
      step,
      moveType,
      serviceType,
      driverId,
      pickupLocationId,
      pickupDate: toIsoOrNull(pickupDate),
      deliveryLocationId,
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
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {modal.type === "CREATE" ? "Leg 생성" : "Leg 수정"}
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
          <SearchableSelect<DriverEntity>
            value={driverId}
            onSelect={(id) => setDriverId(id)}
            fetchList={(q) =>
              fetchDrivers({ q, size: SEARCH_SIZE, activeOnly: true }).then(
                (r) => r.items,
              )
            }
            fetchById={(id) => fetchDriver(id)}
            queryKeyBase={["driver", "search"]}
            getLabel={(d) => `${d.name} (${d.email})`}
            placeholder="— 미지정 —"
            emptyLabel="— 미지정 —"
            disabled={isPending}
          />
        </Field>
        <Field label="Pickup Location">
          <SearchableSelect<LocationEntity>
            value={pickupLocationId}
            onSelect={(id) => setPickupLocationId(id)}
            fetchList={(q) =>
              fetchLocations({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchLocation(id)}
            queryKeyBase={["location", "search"]}
            getLabel={(l) => `${l.name} (${l.kind})`}
            placeholder="—"
            emptyLabel="— 선택 안함 —"
            disabled={isPending}
          />
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
          <SearchableSelect<LocationEntity>
            value={deliveryLocationId}
            onSelect={(id) => setDeliveryLocationId(id)}
            fetchList={(q) =>
              fetchLocations({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchLocation(id)}
            queryKeyBase={["location", "search"]}
            getLabel={(l) => `${l.name} (${l.kind})`}
            placeholder="—"
            emptyLabel="— 선택 안함 —"
            disabled={isPending}
          />
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
    </>
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
