// Dual Transaction 생성 모달.
//
// 드라이버 1명 선택 → 그 드라이버의 leg 목록(useLegsByDriverData)에서
// 반납(return) leg + 픽업(pickup) leg 를 각각 select 로 고른다.
// truckId / scheduledAt / note 는 선택.
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
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useCreateDualTransaction } from "@/hooks/mutations/dual-transaction/use-create-dual-transaction";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useLegsByDriverData } from "@/hooks/queries/use-legs-by-driver-data";
import { useTrucksData } from "@/hooks/queries/use-trucks-data";
import { generateErrorMessage } from "@/lib/error";
import { useDualTransactionCreateModal } from "@/store/dual-transaction-create-modal";
import type { LegEntity } from "@/types";

const toIsoOrNull = (s: string): string | null => {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

export default function DualTransactionCreateModal() {
  const modal = useDualTransactionCreateModal();
  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent className="!max-w-lg">
        {modal.isOpen && <Body onClose={() => modal.actions.close()} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  const { data: driversData, isPending: driversPending, error: driversError } =
    useDriversData(1);
  const { data: trucksData } = useTrucksData(1);

  const [driverId, setDriverId] = useState<number | null>(null);
  const [returnLegId, setReturnLegId] = useState<number | null>(null);
  const [pickupLegId, setPickupLegId] = useState<number | null>(null);
  const [truckId, setTruckId] = useState<number | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");

  const { data: legs } = useLegsByDriverData(driverId);

  const { mutate: createDualTransaction, isPending: isCreateDualTransactionPending } =
    useCreateDualTransaction({
      onSuccess: () => {
        toast.success(t("dualTransaction.toast.created"), {
          position: "top-center",
        });
        onClose();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  if (driversError) return <Fallback />;
  if (driversPending) return <Loader />;

  const drivers = driversData.items;
  const trucks = trucksData?.items ?? [];
  const legOptions: LegEntity[] = legs ?? [];
  const isPending = isCreateDualTransactionPending;

  const handleSave = () => {
    if (!driverId) {
      toast.error(t("dualTransaction.validation.driverRequired"), {
        position: "top-center",
      });
      return;
    }
    if (!returnLegId || !pickupLegId) {
      toast.error(t("dualTransaction.validation.legsRequired"), {
        position: "top-center",
      });
      return;
    }
    if (returnLegId === pickupLegId) {
      toast.error(t("dualTransaction.validation.legsDistinct"), {
        position: "top-center",
      });
      return;
    }
    createDualTransaction({
      driverId,
      returnLegId,
      pickupLegId,
      truckId,
      scheduledAt: toIsoOrNull(scheduledAt),
      note: note.trim() || null,
    });
  };

  const legLabel = (leg: LegEntity) =>
    `#${leg.id} · ${leg.moveType} · ${leg.status}`;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t("dualTransaction.createTitle")}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <Field label={t("dualTransaction.field.driver")} required>
          <select
            value={driverId ?? ""}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : null;
              setDriverId(v);
              setReturnLegId(null);
              setPickupLegId(null);
            }}
            disabled={isPending}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("common.selectPlaceholder")}</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("dualTransaction.field.returnLeg")} required>
          <select
            value={returnLegId ?? ""}
            onChange={(e) =>
              setReturnLegId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isPending || !driverId}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">
              {driverId
                ? t("dualTransaction.legPlaceholder")
                : t("dualTransaction.selectDriverFirst")}
            </option>
            {legOptions.map((leg) => (
              <option key={leg.id} value={leg.id}>
                {legLabel(leg)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("dualTransaction.field.pickupLeg")} required>
          <select
            value={pickupLegId ?? ""}
            onChange={(e) =>
              setPickupLegId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isPending || !driverId}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">
              {driverId
                ? t("dualTransaction.legPlaceholder")
                : t("dualTransaction.selectDriverFirst")}
            </option>
            {legOptions.map((leg) => (
              <option key={leg.id} value={leg.id}>
                {legLabel(leg)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("dualTransaction.field.truck")}>
          <select
            value={truckId ?? ""}
            onChange={(e) =>
              setTruckId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isPending}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("common.none")}</option>
            {trucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                {truck.plateNo}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("dualTransaction.field.scheduledAt")}>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            disabled={isPending}
          />
        </Field>

        <Field label={t("dualTransaction.field.note")}>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? t("common.creating") : t("common.create")}
          </Button>
        </div>
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
