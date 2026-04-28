// 컨테이너 기본 정보 편집 폼 — drawer [기본] 탭.
// controlled inputs, save 시 PATCH.
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChassisSelect from "@/components/chassis/chassis-select";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { useUpdateContainer } from "@/hooks/mutations/container/use-update-container";
import { useDeleteContainer } from "@/hooks/mutations/container/use-delete-container";
import { generateErrorMessage } from "@/lib/error";
import type {
  ContainerEntity,
  ContainerSize,
  DeliveryStatus,
  LocationEntity,
  ServiceType,
} from "@/types";

const SIZES: ContainerSize[] = [
  "20GP", "40GP", "40HC", "40OT", "45HC", "20RF", "40RF",
];
const STATUSES: DeliveryStatus[] = [
  "PLANNING", "DISPATCHED", "YARD_STAGED",
  "FINAL_DELIVERY", "EMPTY_STAGED", "COMPLETED",
];
const SERVICE_TYPES: ServiceType[] = ["LIVE", "DROP"];

export default function ContainerForm({
  container,
}: {
  container: ContainerEntity;
}) {
  const { t } = useTranslation();
  const { data: locationsData } = useLocationsData(1);
  const locations: LocationEntity[] = locationsData?.items ?? [];

  // 컨테이너 변경되면 state 동기화
  const [containerNumber, setContainerNumber] = useState(container.containerNumber ?? "");
  const [sealNo, setSealNo] = useState(container.sealNo ?? "");
  const [size, setSize] = useState<ContainerSize | "">(container.size ?? "");
  const [type, setType] = useState(container.type ?? "");
  const [weightKg, setWeightKg] = useState(
    container.weightKg ? String(container.weightKg) : "",
  );
  const [chassisId, setChassisId] = useState<number | null>(container.chassisId);
  const [demurrageLfd, setDemurrageLfd] = useState(container.demurrageLfd ?? "");
  const [detentionLfd, setDetentionLfd] = useState(container.detentionLfd ?? "");
  const [deliveryLocationId, setDeliveryLocationId] = useState<number | null>(
    container.deliveryLocationId,
  );
  const [returnLocationId, setReturnLocationId] = useState<number | null>(
    container.returnLocationId,
  );
  const [serviceType, setServiceType] = useState<ServiceType | "">(container.serviceType ?? "");
  const [status, setStatus] = useState<DeliveryStatus>(container.status);
  const [note, setNote] = useState(container.note ?? "");

  // 컨테이너 식별자 (id) 가 바뀐 경우만 폼 초기화. profile-editor-modal 패턴과 동일.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    setContainerNumber(container.containerNumber ?? "");
    setSealNo(container.sealNo ?? "");
    setSize(container.size ?? "");
    setType(container.type ?? "");
    setWeightKg(container.weightKg ? String(container.weightKg) : "");
    setChassisId(container.chassisId);
    setDemurrageLfd(container.demurrageLfd ?? "");
    setDetentionLfd(container.detentionLfd ?? "");
    setDeliveryLocationId(container.deliveryLocationId);
    setReturnLocationId(container.returnLocationId);
    setServiceType(container.serviceType ?? "");
    setStatus(container.status);
    setNote(container.note ?? "");
  }, [container.id]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const { mutate: updateContainer, isPending: isUpdateContainerPending } =
    useUpdateContainer({
      onSuccess: () => toast.success(t("container.form.savedToast"), { position: "top-center" }),
      onError: (e) =>
        toast.error(generateErrorMessage(e), { position: "top-center" }),
    });

  const { mutate: deleteContainer, isPending: isDeleteContainerPending } =
    useDeleteContainer(container.deliveryOrderId, {
      onSuccess: () => toast.success(t("container.form.deletedToast"), { position: "top-center" }),
      onError: (e) =>
        toast.error(generateErrorMessage(e), { position: "top-center" }),
    });

  const isPending = isUpdateContainerPending || isDeleteContainerPending;

  const handleSave = () => {
    updateContainer({
      id: container.id,
      payload: {
        containerNumber: containerNumber.trim() || null,
        sealNo: sealNo.trim() || null,
        size: (size || null) as ContainerSize | null,
        type: type.trim() || null,
        weightKg: weightKg.trim() === "" ? null : weightKg.trim(),
        chassisId,
        demurrageLfd: demurrageLfd || null,
        detentionLfd: detentionLfd || null,
        deliveryLocationId,
        returnLocationId,
        serviceType: (serviceType || null) as ServiceType | null,
        status,
        note: note.trim() || null,
      },
    });
  };

  const handleDelete = () => {
    if (!window.confirm(t("container.form.deleteConfirm"))) return;
    deleteContainer(container.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <Row>
        <Field label={t("container.field.containerNumber")}>
          <Input
            value={containerNumber}
            onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
            placeholder="ABCU1234567"
            disabled={isPending}
          />
        </Field>
        <Field label={t("container.field.sealNo")}>
          <Input
            value={sealNo}
            onChange={(e) => setSealNo(e.target.value)}
            disabled={isPending}
          />
        </Field>
      </Row>

      <Row>
        <Field label={t("container.field.size")}>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as ContainerSize | "")}
            disabled={isPending}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">—</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label={t("container.field.type")}>
          <Input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="DRY"
            disabled={isPending}
          />
        </Field>
      </Row>

      <Row>
        <Field label={t("container.field.weightKg")}>
          <Input
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            type="number"
            step="0.01"
            disabled={isPending}
          />
        </Field>
        <Field label={t("container.field.chassis")}>
          <ChassisSelect
            value={chassisId}
            onChange={setChassisId}
            disabled={isPending}
          />
        </Field>
      </Row>

      <Row>
        <Field label={t("container.field.demurrageLfd")}>
          <Input
            type="date"
            value={demurrageLfd}
            onChange={(e) => setDemurrageLfd(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field label={t("container.field.detentionLfd")}>
          <Input
            type="date"
            value={detentionLfd}
            onChange={(e) => setDetentionLfd(e.target.value)}
            disabled={isPending}
          />
        </Field>
      </Row>

      <Row>
        <Field label={t("container.field.deliveryLocation")}>
          <select
            value={deliveryLocationId ?? ""}
            onChange={(e) =>
              setDeliveryLocationId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isPending}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">—</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>
        <Field label={t("container.field.returnLocation")}>
          <select
            value={returnLocationId ?? ""}
            onChange={(e) =>
              setReturnLocationId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isPending}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">—</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>
      </Row>

      <Row>
        <Field label={t("container.field.serviceType")}>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType | "")}
            disabled={isPending}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">—</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label={t("container.field.status")}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
            disabled={isPending}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </Row>

      <Field label={t("container.field.note")}>
        <textarea
          className="min-h-[80px] w-full rounded-md border bg-background p-2 text-sm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isPending}
        />
      </Field>

      <div className="flex justify-between pt-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
        >
          {t("common.delete")}
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
