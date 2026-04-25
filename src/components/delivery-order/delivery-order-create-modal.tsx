// 새 D/O 생성 — 풀스크린 (max-w-3xl) 모달.
// 필드 그룹 (기본/일정/게이트/메타/메모) + container_number 패턴 검증.
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateDeliveryOrder } from "@/hooks/mutations/delivery-order/use-create-delivery-order";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { useTerminalsData } from "@/hooks/queries/use-terminals-data";
import { useVesselsData } from "@/hooks/queries/use-vessels-data";
import { CONTAINER_NUMBER_PATTERN } from "@/lib/delivery-order";
import { generateErrorMessage } from "@/lib/error";
import { useDeliveryOrderCreateModal } from "@/store/delivery-order-create-modal";
import type { ContainerSize, ShipmentDirection } from "@/types";

const SIZES: ContainerSize[] = [
  "20GP",
  "40GP",
  "40HC",
  "40OT",
  "45HC",
  "20RF",
  "40RF",
];

export default function DeliveryOrderCreateModal() {
  const modal = useDeliveryOrderCreateModal();

  const [direction, setDirection] = useState<ShipmentDirection>("IMPORT");
  const [customerId, setCustomerId] = useState("");
  const [blNumber, setBlNumber] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [reference, setReference] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [containerSize, setContainerSize] = useState<ContainerSize | "">("");
  const [containerType, setContainerType] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [terminalId, setTerminalId] = useState("");
  const [vesselId, setVesselId] = useState("");
  const [deliveryLocationId, setDeliveryLocationId] = useState("");
  const [returnLocationId, setReturnLocationId] = useState("");
  const [eta, setEta] = useState("");
  const [pickupAppointment, setPickupAppointment] = useState("");
  const [deliveryAppointment, setDeliveryAppointment] = useState("");
  const [returnAppointment, setReturnAppointment] = useState("");
  const [demurrageLfd, setDemurrageLfd] = useState("");
  const [detentionLfd, setDetentionLfd] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const { data: customersData } = useCustomersData(1);
  const { data: terminalsData } = useTerminalsData(1);
  const { data: vesselsData } = useVesselsData(1);
  const { data: locationsData } = useLocationsData(1);

  useEffect(() => {
    if (!modal.isOpen) return;
    setDirection("IMPORT");
    setCustomerId("");
    setBlNumber("");
    setBookingNumber("");
    setReference("");
    setContainerNumber("");
    setContainerSize("");
    setContainerType("");
    setChassisNumber("");
    setTerminalId("");
    setVesselId("");
    setDeliveryLocationId("");
    setReturnLocationId("");
    setEta("");
    setPickupAppointment("");
    setDeliveryAppointment("");
    setReturnAppointment("");
    setDemurrageLfd("");
    setDetentionLfd("");
    setInternalNote("");
  }, [modal.isOpen]);

  const containerNormalised = useMemo(
    () => containerNumber.toUpperCase().replace(/[\s-]/g, ""),
    [containerNumber],
  );
  const containerInvalid =
    containerNumber !== "" &&
    !CONTAINER_NUMBER_PATTERN.test(containerNormalised);

  const { mutate: createDo, isPending } = useCreateDeliveryOrder({
    onSuccess: () => {
      toast.success("D/O 가 생성되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const toIsoOrNull = (s: string): string | null => {
    if (!s) return null;
    // datetime-local → ISO. 사용자가 입력한 시각은 로컬 zone, ISO 변환은 UTC.
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };
  const dateOrNull = (s: string): string | null => (s ? s : null);

  const handleSave = () => {
    if (!customerId) {
      toast.error("고객사를 선택하세요.", { position: "top-center" });
      return;
    }
    if (containerInvalid) {
      toast.error("컨테이너 번호 형식이 올바르지 않습니다 (예: ABCD1234567).", {
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
      terminalId: terminalId || null,
      vesselId: vesselId || null,
      deliveryLocationId: deliveryLocationId || null,
      returnLocationId: returnLocationId || null,
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
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sans">새 D/O 생성</DialogTitle>
        </DialogHeader>

        <Section title="기본">
          <div className="grid grid-cols-2 gap-3">
            <Field label="방향" required>
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
            <Field label="고객사" required>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={isPending}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">— 선택 —</option>
                {(customersData?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.code ? ` (${c.code})` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="B/L 번호">
              <Input
                value={blNumber}
                onChange={(e) => setBlNumber(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field label="Booking 번호">
              <Input
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field label="Reference">
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                disabled={isPending}
              />
            </Field>
          </div>
        </Section>

        <Section title="컨테이너">
          <div className="grid grid-cols-2 gap-3">
            <Field label="컨테이너 번호 (^[A-Z]{4}\\d{7}$)">
              <Input
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value)}
                disabled={isPending}
                placeholder="MSCU1234567"
                className={
                  containerInvalid ? "border-destructive" : undefined
                }
              />
              {containerInvalid && (
                <span className="text-xs text-destructive">
                  형식이 올바르지 않습니다.
                </span>
              )}
            </Field>
            <Field label="사이즈">
              <select
                value={containerSize}
                onChange={(e) =>
                  setContainerSize(e.target.value as ContainerSize | "")
                }
                disabled={isPending}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="타입">
              <Input
                value={containerType}
                onChange={(e) => setContainerType(e.target.value)}
                disabled={isPending}
                placeholder="DRY / RF / OT 등"
              />
            </Field>
            <Field label="섀시">
              <Input
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                disabled={isPending}
              />
            </Field>
          </div>
        </Section>

        <Section title="메타">
          <div className="grid grid-cols-2 gap-3">
            <Field label="터미널">
              <select
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                disabled={isPending}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {(terminalsData?.items ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="본선">
              <select
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
                disabled={isPending}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {(vesselsData?.items ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="배송 장소">
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
            <Field label="반납 장소">
              <select
                value={returnLocationId}
                onChange={(e) => setReturnLocationId(e.target.value)}
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
          </div>
        </Section>

        <Section title="일정">
          <div className="grid grid-cols-2 gap-3">
            <Field label="ETA">
              <Input
                type="datetime-local"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field label="픽업 약속">
              <Input
                type="datetime-local"
                value={pickupAppointment}
                onChange={(e) => setPickupAppointment(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field label="배송 약속">
              <Input
                type="datetime-local"
                value={deliveryAppointment}
                onChange={(e) => setDeliveryAppointment(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field label="반납 약속">
              <Input
                type="datetime-local"
                value={returnAppointment}
                onChange={(e) => setReturnAppointment(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field label="Demurrage LFD">
              <Input
                type="date"
                value={demurrageLfd}
                onChange={(e) => setDemurrageLfd(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field label="Detention LFD">
              <Input
                type="date"
                value={detentionLfd}
                onChange={(e) => setDetentionLfd(e.target.value)}
                disabled={isPending}
              />
            </Field>
          </div>
        </Section>

        <Section title="메모">
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
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !customerId || containerInvalid}
          >
            {isPending ? "생성중..." : "생성"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
