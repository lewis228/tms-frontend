// Drawer 내용 — 섹션 분리 + 스크롤. 인라인 수정은 Phase 5+. 지금은 읽기 + Status Mover.
import { useTranslation } from "react-i18next";

import StatusBadge from "@/components/delivery-order/status-badge";
import StatusMover from "@/components/delivery-order/status-mover";
import LegTimeline from "@/components/delivery-order/leg-timeline";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useTerminalsData } from "@/hooks/queries/use-terminals-data";
import { useVesselsData } from "@/hooks/queries/use-vessels-data";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { formatDate, formatDateTime } from "@/lib/format";
import type { DeliveryOrderEntity } from "@/types";

export default function DeliveryOrderDetail({
  deliveryOrder,
}: {
  deliveryOrder: DeliveryOrderEntity;
}) {
  const { t } = useTranslation();
  // FK 라벨 lookup. 1페이지만 — 100건 이하 가정.
  const { data: customersData } = useCustomersData(1);
  const { data: terminalsData } = useTerminalsData(1);
  const { data: vesselsData } = useVesselsData(1);
  const { data: locationsData } = useLocationsData(1);

  const dash = t("common.none");

  const customerName =
    customersData?.items.find((c) => c.id === deliveryOrder.customerId)?.name ??
    dash;
  const terminalName = deliveryOrder.terminalId
    ? (terminalsData?.items.find((tt) => tt.id === deliveryOrder.terminalId)
        ?.name ?? dash)
    : dash;
  const vesselName = deliveryOrder.vesselId
    ? (vesselsData?.items.find((v) => v.id === deliveryOrder.vesselId)?.name ??
      dash)
    : dash;
  const deliveryLocationName = deliveryOrder.deliveryLocationId
    ? (locationsData?.items.find(
        (l) => l.id === deliveryOrder.deliveryLocationId,
      )?.name ?? dash)
    : dash;
  const returnLocationName = deliveryOrder.returnLocationId
    ? (locationsData?.items.find((l) => l.id === deliveryOrder.returnLocationId)
        ?.name ?? dash)
    : dash;

  return (
    <div className="flex flex-col gap-5 pt-4">
      <Section title={t("deliveryOrder.section.status")}>
        <div className="flex items-center gap-2">
          <StatusBadge status={deliveryOrder.status} />
          <span className="text-xs text-muted-foreground">
            {t("deliveryOrder.directionPrefix")} {deliveryOrder.direction}
          </span>
        </div>
        <StatusMover deliveryOrder={deliveryOrder} />
      </Section>

      <Section title={t("deliveryOrder.section.basicInfo")}>
        <Field label={t("deliveryOrder.field.blNumber")} value={deliveryOrder.blNumber} />
        <Field label={t("deliveryOrder.field.booking")} value={deliveryOrder.bookingNumber} />
        <Field label={t("deliveryOrder.field.reference")} value={deliveryOrder.reference} />
        <Field
          label={t("deliveryOrder.field.container")}
          value={deliveryOrder.containerNumber}
          mono
        />
        <Field label={t("deliveryOrder.field.containerSizeLong")} value={deliveryOrder.containerSize} />
        <Field label={t("deliveryOrder.field.containerTypeLong")} value={deliveryOrder.containerType} />
        <Field label={t("deliveryOrder.field.chassisNumber")} value={deliveryOrder.chassisNumber} />
        <Field label={t("deliveryOrder.field.customer")} value={customerName} />
      </Section>

      <Section title={t("deliveryOrder.section.schedule")}>
        <Field label={t("deliveryOrder.field.eta")} value={fmt(deliveryOrder.eta)} />
        <Field label={t("deliveryOrder.field.pickupAppointmentLong")} value={fmt(deliveryOrder.pickupAppointment)} />
        <Field
          label={t("deliveryOrder.field.deliveryAppointmentLong")}
          value={fmt(deliveryOrder.deliveryAppointment)}
        />
        <Field label={t("deliveryOrder.field.returnAppointmentLong")} value={fmt(deliveryOrder.returnAppointment)} />
        <Field label={t("deliveryOrder.field.demurrageLfd")} value={fmtDate(deliveryOrder.demurrageLfd)} />
        <Field label={t("deliveryOrder.field.detentionLfd")} value={fmtDate(deliveryOrder.detentionLfd)} />
        <Field label={t("deliveryOrder.field.emptyDate")} value={fmtDate(deliveryOrder.emptyDate)} />
        <Field label={t("deliveryOrder.field.loadedDate")} value={fmtDate(deliveryOrder.loadedDate)} />
      </Section>

      <Section title={t("deliveryOrder.section.gatesCondition")}>
        <GateRow label={t("deliveryOrder.gates.blReleased")} checked={deliveryOrder.blReleased} dash={dash} />
        <GateRow label={t("deliveryOrder.gates.pierPassPaid")} checked={deliveryOrder.pierPassPaid} dash={dash} />
        <GateRow label={t("deliveryOrder.gates.customsCleared")} checked={deliveryOrder.customsCleared} dash={dash} />
      </Section>

      <Section title={t("deliveryOrder.section.meta")}>
        <Field label={t("deliveryOrder.field.terminal")} value={terminalName} />
        <Field label={t("deliveryOrder.field.vessel")} value={vesselName} />
        <Field label={t("deliveryOrder.field.deliveryLocation")} value={deliveryLocationName} />
        <Field label={t("deliveryOrder.field.returnLocation")} value={returnLocationName} />
      </Section>

      <Section title={t("deliveryOrder.section.legTimeline")}>
        <LegTimeline deliveryOrderId={deliveryOrder.id} />
      </Section>

      <Section title={t("deliveryOrder.section.note")}>
        <p className="whitespace-pre-wrap text-sm text-foreground/80">
          {deliveryOrder.internalNote ?? dash}
        </p>
      </Section>
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
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-2 rounded-md border p-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : ""}>{value || "—"}</span>
    </div>
  );
}

function GateRow({
  label,
  checked,
  dash,
}: {
  label: string;
  checked: boolean;
  dash: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <span className={checked ? "text-green-600" : "text-muted-foreground"}>
        {checked ? "✓" : dash}
      </span>
    </div>
  );
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return "";
  return formatDateTime(iso, iso);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return formatDate(iso, iso);
}
