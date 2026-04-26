// Drawer 내용 — 섹션 분리 + 스크롤. 인라인 수정은 Phase 5+. 지금은 읽기 + Status Mover.
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
  // FK 라벨 lookup. 1페이지만 — 100건 이하 가정.
  const { data: customersData } = useCustomersData(1);
  const { data: terminalsData } = useTerminalsData(1);
  const { data: vesselsData } = useVesselsData(1);
  const { data: locationsData } = useLocationsData(1);

  const customerName =
    customersData?.items.find((c) => c.id === deliveryOrder.customerId)?.name ??
    "—";
  const terminalName = deliveryOrder.terminalId
    ? (terminalsData?.items.find((t) => t.id === deliveryOrder.terminalId)
        ?.name ?? "—")
    : "—";
  const vesselName = deliveryOrder.vesselId
    ? (vesselsData?.items.find((v) => v.id === deliveryOrder.vesselId)?.name ??
      "—")
    : "—";
  const deliveryLocationName = deliveryOrder.deliveryLocationId
    ? (locationsData?.items.find(
        (l) => l.id === deliveryOrder.deliveryLocationId,
      )?.name ?? "—")
    : "—";
  const returnLocationName = deliveryOrder.returnLocationId
    ? (locationsData?.items.find((l) => l.id === deliveryOrder.returnLocationId)
        ?.name ?? "—")
    : "—";

  return (
    <div className="flex flex-col gap-5 pt-4">
      <Section title="상태">
        <div className="flex items-center gap-2">
          <StatusBadge status={deliveryOrder.status} />
          <span className="text-xs text-muted-foreground">
            방향: {deliveryOrder.direction}
          </span>
        </div>
        <StatusMover deliveryOrder={deliveryOrder} />
      </Section>

      <Section title="기본 정보">
        <Field label="B/L 번호" value={deliveryOrder.blNumber} />
        <Field label="Booking" value={deliveryOrder.bookingNumber} />
        <Field label="Reference" value={deliveryOrder.reference} />
        <Field
          label="컨테이너"
          value={deliveryOrder.containerNumber}
          mono
        />
        <Field label="컨테이너 사이즈" value={deliveryOrder.containerSize} />
        <Field label="컨테이너 타입" value={deliveryOrder.containerType} />
        <Field label="섀시" value={deliveryOrder.chassisNumber} />
        <Field label="고객사" value={customerName} />
      </Section>

      <Section title="일정">
        <Field label="ETA" value={fmt(deliveryOrder.eta)} />
        <Field label="픽업 약속" value={fmt(deliveryOrder.pickupAppointment)} />
        <Field
          label="배송 약속"
          value={fmt(deliveryOrder.deliveryAppointment)}
        />
        <Field label="반납 약속" value={fmt(deliveryOrder.returnAppointment)} />
        <Field label="Demurrage LFD" value={fmtDate(deliveryOrder.demurrageLfd)} />
        <Field label="Detention LFD" value={fmtDate(deliveryOrder.detentionLfd)} />
        <Field label="Empty 일자" value={fmtDate(deliveryOrder.emptyDate)} />
        <Field label="Loaded 일자" value={fmtDate(deliveryOrder.loadedDate)} />
      </Section>

      <Section title="게이트 조건">
        <GateRow label="B/L Released" checked={deliveryOrder.blReleased} />
        <GateRow label="Pier Pass Paid" checked={deliveryOrder.pierPassPaid} />
        <GateRow label="Customs Cleared" checked={deliveryOrder.customsCleared} />
      </Section>

      <Section title="메타">
        <Field label="터미널" value={terminalName} />
        <Field label="본선" value={vesselName} />
        <Field label="배송 장소" value={deliveryLocationName} />
        <Field label="반납 장소" value={returnLocationName} />
      </Section>

      <Section title="Leg Timeline">
        <LegTimeline deliveryOrderId={deliveryOrder.id} />
      </Section>

      <Section title="메모">
        <p className="whitespace-pre-wrap text-sm text-foreground/80">
          {deliveryOrder.internalNote ?? "—"}
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

function GateRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <span className={checked ? "text-green-600" : "text-muted-foreground"}>
        {checked ? "✓" : "—"}
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
