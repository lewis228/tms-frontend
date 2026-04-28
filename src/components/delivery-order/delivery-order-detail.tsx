// D/O Detail — 헤더 + 컨테이너 sub-table + leg timeline.
//
// H-1 이후: 컨테이너별 정보는 ContainerEntity 1:N 으로 분리. 컨테이너 row 를 클릭하면
// URL ?container={id} 가 붙고 ContainerDrawer 가 열림 (delivery-order-drawer 의 형제).
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import StatusBadge from "@/components/delivery-order/status-badge";
import StatusMover from "@/components/delivery-order/status-mover";
import LegTimeline from "@/components/delivery-order/leg-timeline";
import ContainerSubTable from "@/components/container/container-sub-table";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useTerminalsData } from "@/hooks/queries/use-terminals-data";
import { useVesselsData } from "@/hooks/queries/use-vessels-data";
import { formatDateTime } from "@/lib/format";
import type { DeliveryOrderDetailEntity } from "@/types";

export default function DeliveryOrderDetail({
  deliveryOrder,
}: {
  deliveryOrder: DeliveryOrderDetailEntity;
}) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const { data: customersData } = useCustomersData(1);
  const { data: terminalsData } = useTerminalsData(1);
  const { data: vesselsData } = useVesselsData(1);

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

  const handleOpenContainer = (containerId: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("container", String(containerId));
        return next;
      },
      { replace: true },
    );
  };

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
        <Field label={t("deliveryOrder.field.customer")} value={customerName} />
        <Field label={t("deliveryOrder.field.terminal")} value={terminalName} />
        <Field label={t("deliveryOrder.field.vessel")} value={vesselName} />
        <Field label={t("deliveryOrder.field.eta")} value={fmt(deliveryOrder.eta)} />
        <GateRow
          label={t("deliveryOrder.gates.blReleased")}
          checked={deliveryOrder.blReleased}
          dash={dash}
        />
      </Section>

      <Section
        title={`${t("container.section.title")} (${deliveryOrder.containers.length})`}
      >
        <ContainerSubTable
          containers={deliveryOrder.containers}
          onOpenContainer={handleOpenContainer}
        />
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
