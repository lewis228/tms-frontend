// 새 D/O 생성 — 풀스크린 (max-w-3xl) 모달.
//
// H-1 이후: D/O 헤더 + 컨테이너 sub-form (N개). containers 배열로 백엔드에 전송.
// AI Intake prefill 도 containers[] 배열로 받음.
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { fetchCustomers } from "@/api/customer";
import { fetchLocations } from "@/api/location";
import { fetchTerminals } from "@/api/terminal";
import { fetchVessels } from "@/api/vessel";
import SearchableSelect from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateDeliveryOrder } from "@/hooks/mutations/delivery-order/use-create-delivery-order";
import { CONTAINER_NUMBER_PATTERN } from "@/lib/delivery-order";
import { generateErrorMessage } from "@/lib/error";
import { useDeliveryOrderCreateModal } from "@/store/delivery-order-create-modal";
import type { ContainerCreateInnerPayload } from "@/api/container";
import type {
  ContainerSize,
  CustomerEntity,
  LocationEntity,
  ServiceType,
  ShipmentDirection,
  TerminalEntity,
  VesselEntity,
} from "@/types";

const SEARCH_SIZE = 50;

const SIZES: ContainerSize[] = [
  "20GP", "40GP", "40HC", "40OT", "45HC", "20RF", "40RF",
];
const ALLOWED_SIZES = new Set<string>(SIZES);
const SERVICE_TYPES: ServiceType[] = ["LIVE", "DROP"];

type Modal = ReturnType<typeof useDeliveryOrderCreateModal>;

export default function DeliveryOrderCreateModal() {
  const modal = useDeliveryOrderCreateModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto">
        {modal.isOpen && <Body modal={modal} />}
      </DialogContent>
    </Dialog>
  );
}

const isoToLocalInput = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const dateToInput = (s: string | null | undefined): string =>
  s ? s.slice(0, 10) : "";
const toIsoOrNull = (s: string): string | null => {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

type ContainerFormRow = {
  containerNumber: string;
  sealNo: string;
  size: ContainerSize | "";
  type: string;
  weightKg: string;
  chassisNumber: string;
  pickupAppointment: string;
  deliveryAppointment: string;
  returnAppointment: string;
  demurrageLfd: string;
  detentionLfd: string;
  serviceType: ServiceType | "";
};

const emptyRow = (): ContainerFormRow => ({
  containerNumber: "",
  sealNo: "",
  size: "",
  type: "",
  weightKg: "",
  chassisNumber: "",
  pickupAppointment: "",
  deliveryAppointment: "",
  returnAppointment: "",
  demurrageLfd: "",
  detentionLfd: "",
  serviceType: "",
});

function Body({ modal }: { modal: Modal }) {
  const { t } = useTranslation();
  const p = modal.prefill ?? null;

  // ── 헤더 fields ─────────────────────────────────
  const [direction, setDirection] = useState<ShipmentDirection>(
    p?.direction === "EXPORT" ? "EXPORT" : "IMPORT",
  );
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [blNumber, setBlNumber] = useState(p?.bl_number ?? "");
  const [bookingNumber, setBookingNumber] = useState(p?.booking_number ?? "");
  const [reference, setReference] = useState(p?.reference ?? "");
  const [terminalId, setTerminalId] = useState<number | null>(null);
  const [vesselId, setVesselId] = useState<number | null>(null);
  const [eta, setEta] = useState(isoToLocalInput(p?.eta));
  const [internalNote, setInternalNote] = useState("");

  // ── 컨테이너 rows (prefill 의 containers 배열로 초기화) ─────
  const initialRows = useMemo<ContainerFormRow[]>(() => {
    const containers = p?.containers ?? [];
    if (containers.length === 0) return [emptyRow()];
    return containers.map((c) => ({
      containerNumber: c.container_number ?? "",
      sealNo: c.seal_no ?? "",
      size: c.size && ALLOWED_SIZES.has(c.size) ? (c.size as ContainerSize) : "",
      type: c.type ?? "",
      weightKg: c.weight_kg != null ? String(c.weight_kg) : "",
      chassisNumber: c.chassis_number ?? "",
      pickupAppointment: isoToLocalInput(c.pickup_appointment),
      deliveryAppointment: isoToLocalInput(c.delivery_appointment),
      returnAppointment: isoToLocalInput(c.return_appointment),
      demurrageLfd: dateToInput(c.demurrage_lfd),
      detentionLfd: dateToInput(c.detention_lfd),
      serviceType: c.service_type === "LIVE" || c.service_type === "DROP"
        ? (c.service_type as ServiceType) : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [rows, setRows] = useState<ContainerFormRow[]>(initialRows);

  const updateRow = (idx: number, patch: Partial<ContainerFormRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (idx: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  // ── per-row container 번호 검증 ──
  const rowsWithValidation = rows.map((r) => {
    const normalised = r.containerNumber.toUpperCase().replace(/[\s-]/g, "");
    const invalid =
      r.containerNumber !== "" && !CONTAINER_NUMBER_PATTERN.test(normalised);
    return { ...r, normalised, invalid };
  });
  const anyInvalid = rowsWithValidation.some((r) => r.invalid);

  const { mutate: createDo, isPending } = useCreateDeliveryOrder({
    onSuccess: () => {
      toast.success(t("deliveryOrder.createSuccess"), { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSave = () => {
    if (!customerId) {
      toast.error(t("deliveryOrder.validation.customerRequired"), {
        position: "top-center",
      });
      return;
    }
    if (anyInvalid) {
      toast.error(t("deliveryOrder.validation.containerInvalid"), {
        position: "top-center",
      });
      return;
    }
    const containers: ContainerCreateInnerPayload[] = rowsWithValidation.map((r, idx) => ({
      sequenceNo: idx + 1,
      containerNumber: r.normalised || null,
      sealNo: r.sealNo.trim() || null,
      size: r.size || null,
      type: r.type.trim() || null,
      weightKg: r.weightKg.trim() === "" ? null : r.weightKg.trim(),
      chassisNumber: r.chassisNumber.trim() || null,
      pickupAppointment: toIsoOrNull(r.pickupAppointment),
      deliveryAppointment: toIsoOrNull(r.deliveryAppointment),
      returnAppointment: toIsoOrNull(r.returnAppointment),
      demurrageLfd: r.demurrageLfd || null,
      detentionLfd: r.detentionLfd || null,
      serviceType: r.serviceType || null,
    }));

    createDo({
      direction,
      customerId,
      blNumber: blNumber.trim() || null,
      bookingNumber: bookingNumber.trim() || null,
      reference: reference.trim() || null,
      terminalId,
      vesselId,
      eta: toIsoOrNull(eta),
      internalNote: internalNote.trim() || null,
      containers,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t("deliveryOrder.createTitleNew")}
        </DialogTitle>
      </DialogHeader>

      <Section title={t("deliveryOrder.section.basic")}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("deliveryOrder.field.direction")} required>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as ShipmentDirection)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="IMPORT">IMPORT</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </Field>
          <Field label={t("deliveryOrder.field.customer")} required>
            <SearchableSelect<CustomerEntity>
              value={customerId}
              onSelect={(id) => setCustomerId(id)}
              fetchList={(q) =>
                fetchCustomers({ q, size: SEARCH_SIZE }).then((r) => r.items)
              }
              queryKeyBase={["customer", "search"]}
              getLabel={(c) => `${c.name}${c.code ? ` (${c.code})` : ""}`}
              placeholder={t("deliveryOrder.customerPlaceholder")}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.blNumber")}>
            <Input
              value={blNumber}
              onChange={(e) => setBlNumber(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.bookingNumber")}>
            <Input
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.reference")}>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.eta")}>
            <Input
              type="datetime-local"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              disabled={isPending}
            />
          </Field>
        </div>
      </Section>

      <Section title={t("deliveryOrder.section.meta")}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("deliveryOrder.field.terminal")}>
            <SearchableSelect<TerminalEntity>
              value={terminalId}
              onSelect={(id) => setTerminalId(id)}
              fetchList={(q) =>
                fetchTerminals({ q, size: SEARCH_SIZE }).then((r) => r.items)
              }
              queryKeyBase={["terminal", "search"]}
              getLabel={(term) => term.name}
              placeholder={t("common.none")}
              emptyLabel={t("common.noSelection")}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.vessel")}>
            <SearchableSelect<VesselEntity>
              value={vesselId}
              onSelect={(id) => setVesselId(id)}
              fetchList={(q) =>
                fetchVessels({ q, size: SEARCH_SIZE }).then((r) => r.items)
              }
              queryKeyBase={["vessel", "search"]}
              getLabel={(v) => v.name}
              placeholder={t("common.none")}
              emptyLabel={t("common.noSelection")}
              disabled={isPending}
            />
          </Field>
        </div>
      </Section>

      <Section
        title={`${t("container.section.title")} (${rowsWithValidation.length})`}
      >
        {rowsWithValidation.map((row, idx) => (
          <ContainerRow
            key={idx}
            idx={idx}
            row={row}
            onChange={(patch) => updateRow(idx, patch)}
            onRemove={rows.length > 1 ? () => removeRow(idx) : undefined}
            disabled={isPending}
          />
        ))}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={addRow} disabled={isPending}>
            + {t("container.addRow")}
          </Button>
        </div>
      </Section>

      <Section title={t("field.note")}>
        <Input
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          disabled={isPending}
        />
      </Section>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => modal.actions.close()}
          disabled={isPending}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending || !customerId || anyInvalid}
        >
          {isPending ? t("deliveryOrder.creating") : t("common.create")}
        </Button>
      </div>
    </>
  );
}

function ContainerRow({
  idx,
  row,
  onChange,
  onRemove,
  disabled,
}: {
  idx: number;
  row: ContainerFormRow & { invalid: boolean };
  onChange: (patch: Partial<ContainerFormRow>) => void;
  onRemove?: () => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          #{idx + 1}
        </span>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("container.field.containerNumber")}>
          <Input
            value={row.containerNumber}
            onChange={(e) => onChange({ containerNumber: e.target.value.toUpperCase() })}
            disabled={disabled}
            placeholder="ABCU1234567"
            className={row.invalid ? "border-destructive" : undefined}
          />
          {row.invalid && (
            <span className="text-xs text-destructive">
              {t("deliveryOrder.containerInvalidShort")}
            </span>
          )}
        </Field>
        <Field label={t("container.field.sealNo")}>
          <Input
            value={row.sealNo}
            onChange={(e) => onChange({ sealNo: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label={t("container.field.size")}>
          <select
            value={row.size}
            onChange={(e) => onChange({ size: e.target.value as ContainerSize | "" })}
            disabled={disabled}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label={t("container.field.type")}>
          <Input
            value={row.type}
            onChange={(e) => onChange({ type: e.target.value })}
            disabled={disabled}
            placeholder="DRY"
          />
        </Field>
        <Field label={t("container.field.weightKg")}>
          <Input
            value={row.weightKg}
            onChange={(e) => onChange({ weightKg: e.target.value })}
            disabled={disabled}
            type="number"
            step="0.01"
          />
        </Field>
        <Field label={t("container.field.chassisNumber")}>
          <Input
            value={row.chassisNumber}
            onChange={(e) => onChange({ chassisNumber: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label={t("container.field.serviceType")}>
          <select
            value={row.serviceType}
            onChange={(e) => onChange({ serviceType: e.target.value as ServiceType | "" })}
            disabled={disabled}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label={t("container.field.deliveryLocation")}>
          <SearchableSelect<LocationEntity>
            value={null}
            onSelect={() => {
              /* H-1: location 은 row 별로 받도록 추후 — 지금은 폼 유지 단순화 */
            }}
            fetchList={(q) =>
              fetchLocations({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            queryKeyBase={["location", "search", `do-row-${idx}`]}
            getLabel={(l) => `${l.name} (${l.kind})`}
            placeholder={t("common.none")}
            emptyLabel={t("common.noSelection")}
            disabled={disabled}
          />
        </Field>
        <Field label={t("container.field.demurrageLfd")}>
          <Input
            type="date"
            value={row.demurrageLfd}
            onChange={(e) => onChange({ demurrageLfd: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label={t("container.field.detentionLfd")}>
          <Input
            type="date"
            value={row.detentionLfd}
            onChange={(e) => onChange({ detentionLfd: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label={t("container.field.pickupAppointment")}>
          <Input
            type="datetime-local"
            value={row.pickupAppointment}
            onChange={(e) => onChange({ pickupAppointment: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label={t("container.field.deliveryAppointment")}>
          <Input
            type="datetime-local"
            value={row.deliveryAppointment}
            onChange={(e) => onChange({ deliveryAppointment: e.target.value })}
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 border-t pt-3 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
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
