// 새 D/O 생성 — 풀스크린 (max-w-3xl) 모달.
// 필드 그룹 (기본/일정/게이트/메타/메모) + container_number 패턴 검증.
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
import type {
  ContainerSize,
  CustomerEntity,
  LocationEntity,
  ShipmentDirection,
  TerminalEntity,
  VesselEntity,
} from "@/types";

const SEARCH_SIZE = 50;

const SIZES: ContainerSize[] = [
  "20GP",
  "40GP",
  "40HC",
  "40OT",
  "45HC",
  "20RF",
  "40RF",
];

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

// AI Intake 추출 결과 → input 포맷 변환 유틸.
// datetime-local input: "YYYY-MM-DDTHH:mm". date input: "YYYY-MM-DD".
const isoToLocalInput = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const dateToInput = (s: string | null | undefined): string =>
  s ? s.slice(0, 10) : "";

const ALLOWED_SIZES: ContainerSize[] = ["20GP", "40GP", "40HC", "40OT", "45HC", "20RF", "40RF"];

function Body({ modal }: { modal: Modal }) {
  const { t } = useTranslation();
  // AI Intake prefill — modal.prefill 이 있으면 초기값으로 사용. 없으면 빈값.
  const p = modal.prefill ?? null;
  const initContainerSize = ((): ContainerSize | "" => {
    const s = p?.container_size;
    return s && (ALLOWED_SIZES as readonly string[]).includes(s) ? (s as ContainerSize) : "";
  })();

  const [direction, setDirection] = useState<ShipmentDirection>("IMPORT");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [blNumber, setBlNumber] = useState(p?.bl_number ?? "");
  const [bookingNumber, setBookingNumber] = useState(p?.booking_number ?? "");
  const [reference, setReference] = useState(p?.reference ?? "");
  const [containerNumber, setContainerNumber] = useState(p?.container_number ?? "");
  const [containerSize, setContainerSize] = useState<ContainerSize | "">(initContainerSize);
  const [containerType, setContainerType] = useState(p?.container_type ?? "");
  const [chassisNumber, setChassisNumber] = useState(p?.chassis_number ?? "");
  const [terminalId, setTerminalId] = useState<number | null>(null);
  const [vesselId, setVesselId] = useState<number | null>(null);
  const [deliveryLocationId, setDeliveryLocationId] = useState<number | null>(null);
  const [returnLocationId, setReturnLocationId] = useState<number | null>(null);
  const [eta, setEta] = useState(isoToLocalInput(p?.eta));
  const [pickupAppointment, setPickupAppointment] = useState(isoToLocalInput(p?.pickup_appointment));
  const [deliveryAppointment, setDeliveryAppointment] = useState(isoToLocalInput(p?.delivery_appointment));
  const [returnAppointment, setReturnAppointment] = useState(isoToLocalInput(p?.return_appointment));
  const [demurrageLfd, setDemurrageLfd] = useState(dateToInput(p?.demurrage_lfd));
  const [detentionLfd, setDetentionLfd] = useState(dateToInput(p?.detention_lfd));
  const [internalNote, setInternalNote] = useState("");


  const containerNormalised = useMemo(
    () => containerNumber.toUpperCase().replace(/[\s-]/g, ""),
    [containerNumber],
  );
  const containerInvalid =
    containerNumber !== "" &&
    !CONTAINER_NUMBER_PATTERN.test(containerNormalised);

  const { mutate: createDo, isPending } = useCreateDeliveryOrder({
    onSuccess: () => {
      toast.success(t("deliveryOrder.createSuccess"), { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const toIsoOrNull = (s: string): string | null => {
    if (!s) return null;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };
  const dateOrNull = (s: string): string | null => (s ? s : null);

  const handleSave = () => {
    if (!customerId) {
      toast.error(t("deliveryOrder.validation.customerRequired"), {
        position: "top-center",
      });
      return;
    }
    if (containerInvalid) {
      toast.error(t("deliveryOrder.validation.containerInvalid"), {
        position: "top-center",
      });
      return;
    }
    createDo({
      direction,
      customerId,
      blNumber: blNumber.trim() || null,
      bookingNumber: bookingNumber.trim() || null,
      reference: reference.trim() || null,
      containerNumber: containerNormalised || null,
      containerSize: containerSize || null,
      containerType: containerType.trim() || null,
      chassisNumber: chassisNumber.trim() || null,
      terminalId,
      vesselId,
      deliveryLocationId,
      returnLocationId,
      eta: toIsoOrNull(eta),
      pickupAppointment: toIsoOrNull(pickupAppointment),
      deliveryAppointment: toIsoOrNull(deliveryAppointment),
      returnAppointment: toIsoOrNull(returnAppointment),
      demurrageLfd: dateOrNull(demurrageLfd),
      detentionLfd: dateOrNull(detentionLfd),
      internalNote: internalNote.trim() || null,
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
              onChange={(e) =>
                setDirection(e.target.value as ShipmentDirection)
              }
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
        </div>
      </Section>

      <Section title={t("deliveryOrder.section.container")}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("deliveryOrder.field.containerNumberWithPattern")}>
            <Input
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value)}
              disabled={isPending}
              placeholder={t("deliveryOrder.containerPlaceholder")}
              className={containerInvalid ? "border-destructive" : undefined}
            />
            {containerInvalid && (
              <span className="text-xs text-destructive">
                {t("deliveryOrder.containerInvalidShort")}
              </span>
            )}
          </Field>
          <Field label={t("deliveryOrder.field.containerSize")}>
            <select
              value={containerSize}
              onChange={(e) =>
                setContainerSize(e.target.value as ContainerSize | "")
              }
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">{t("common.none")}</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("deliveryOrder.field.containerType")}>
            <Input
              value={containerType}
              onChange={(e) => setContainerType(e.target.value)}
              disabled={isPending}
              placeholder={t("deliveryOrder.containerTypePlaceholder")}
            />
          </Field>
          <Field label={t("deliveryOrder.field.chassisNumber")}>
            <Input
              value={chassisNumber}
              onChange={(e) => setChassisNumber(e.target.value)}
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
          <Field label={t("deliveryOrder.field.deliveryLocation")}>
            <SearchableSelect<LocationEntity>
              value={deliveryLocationId}
              onSelect={(id) => setDeliveryLocationId(id)}
              fetchList={(q) =>
                fetchLocations({ q, size: SEARCH_SIZE }).then((r) => r.items)
              }
              queryKeyBase={["location", "search"]}
              getLabel={(l) => `${l.name} (${l.kind})`}
              placeholder={t("common.none")}
              emptyLabel={t("common.noSelection")}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.returnLocation")}>
            <SearchableSelect<LocationEntity>
              value={returnLocationId}
              onSelect={(id) => setReturnLocationId(id)}
              fetchList={(q) =>
                fetchLocations({ q, size: SEARCH_SIZE }).then((r) => r.items)
              }
              queryKeyBase={["location", "search"]}
              getLabel={(l) => `${l.name} (${l.kind})`}
              placeholder={t("common.none")}
              emptyLabel={t("common.noSelection")}
              disabled={isPending}
            />
          </Field>
        </div>
      </Section>

      <Section title={t("deliveryOrder.section.schedule")}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("deliveryOrder.field.eta")}>
            <Input
              type="datetime-local"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.pickupAppointmentLong")}>
            <Input
              type="datetime-local"
              value={pickupAppointment}
              onChange={(e) => setPickupAppointment(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.deliveryAppointmentLong")}>
            <Input
              type="datetime-local"
              value={deliveryAppointment}
              onChange={(e) => setDeliveryAppointment(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.returnAppointmentLong")}>
            <Input
              type="datetime-local"
              value={returnAppointment}
              onChange={(e) => setReturnAppointment(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.demurrageLfd")}>
            <Input
              type="date"
              value={demurrageLfd}
              onChange={(e) => setDemurrageLfd(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("deliveryOrder.field.detentionLfd")}>
            <Input
              type="date"
              value={detentionLfd}
              onChange={(e) => setDetentionLfd(e.target.value)}
              disabled={isPending}
            />
          </Field>
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
          disabled={isPending || !customerId || containerInvalid}
        >
          {isPending ? t("deliveryOrder.creating") : t("common.create")}
        </Button>
      </div>
    </>
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
