// Status Mover — 다음 가능한 transition 버튼 + 게이트 조건 미충족 시 빨간 표시.
//
// 게이트 조건 (백엔드 state_machine.py 와 동일 — 클라이언트는 사전 안내만, 최종 검증은 서버):
// - PLANNING → DISPATCHED:
//     first leg 존재 + bl_released + pier_pass_paid + customs_cleared
//     + pickup_appointment + first_leg.driver_id + first_leg.pickup_date
// - DISPATCHED → YARD_STAGED: first leg COMPLETED + delivery_location.kind = YARD
// - DISPATCHED → FINAL_DELIVERY: first leg COMPLETED + delivery_location.kind = CUSTOMER + delivery_appointment
// - YARD_STAGED → FINAL_DELIVERY: 야드→고객사 leg COMPLETED + delivery_appointment
// - FINAL_DELIVERY → EMPTY_STAGED: 반납 leg COMPLETED + delivery_location.kind = YARD
// - FINAL_DELIVERY|EMPTY_STAGED → COMPLETED:
//     반납 leg COMPLETED + return_location + return_appointment + detention_lfd
//     + (IMPORT 면 empty_date / EXPORT 면 loaded_date)
//
// Phase 4 에서는 D/O 자체 필드만 클라 검증 (leg 검증은 백엔드에 위임). leg 관련 게이트는 hint 만.
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useTransitionDeliveryOrder } from "@/hooks/mutations/delivery-order/use-transition-delivery-order";
import { ALLOWED_TRANSITIONS } from "@/lib/delivery-order";
import { generateErrorMessage } from "@/lib/error";
import type { DeliveryOrderEntity, DeliveryStatus } from "@/types";

type GateCheck = { ok: boolean; label: string };

function checkGates(
  d: DeliveryOrderEntity,
  target: DeliveryStatus,
  t: (k: string) => string,
): GateCheck[] {
  const checks: GateCheck[] = [];
  if (d.status === "PLANNING" && target === "DISPATCHED") {
    checks.push({ ok: d.blReleased, label: t("leg.statusMover.gate.blReleased") });
    checks.push({ ok: d.pierPassPaid, label: t("leg.statusMover.gate.pierPassPaid") });
    checks.push({ ok: d.customsCleared, label: t("leg.statusMover.gate.customsCleared") });
    checks.push({
      ok: !!d.pickupAppointment,
      label: t("leg.statusMover.gate.pickupAppointment"),
    });
    checks.push({ ok: true, label: t("leg.statusMover.gate.firstLegDriver") });
  }
  if (
    (d.status === "DISPATCHED" || d.status === "YARD_STAGED") &&
    target === "FINAL_DELIVERY"
  ) {
    checks.push({
      ok: !!d.deliveryAppointment,
      label: t("leg.statusMover.gate.deliveryAppointment"),
    });
    checks.push({ ok: true, label: t("leg.statusMover.gate.firstLegCompleted") });
  }
  if (target === "COMPLETED") {
    checks.push({ ok: !!d.returnLocationId, label: t("leg.statusMover.gate.returnLocation") });
    checks.push({ ok: !!d.returnAppointment, label: t("leg.statusMover.gate.returnAppointment") });
    checks.push({ ok: !!d.detentionLfd, label: t("leg.statusMover.gate.detentionLfd") });
    if (d.direction === "IMPORT") {
      checks.push({ ok: !!d.emptyDate, label: t("leg.statusMover.gate.emptyDate") });
    } else {
      checks.push({ ok: !!d.loadedDate, label: t("leg.statusMover.gate.loadedDate") });
    }
    checks.push({ ok: true, label: t("leg.statusMover.gate.returnLegCompleted") });
  }
  return checks;
}

export default function StatusMover({
  deliveryOrder,
}: {
  deliveryOrder: DeliveryOrderEntity;
}) {
  const { t } = useTranslation();
  const targets = ALLOWED_TRANSITIONS[deliveryOrder.status];
  const { mutate: transition, isPending } = useTransitionDeliveryOrder({
    onSuccess: () =>
      toast.success(t("leg.statusMover.transitionedToast"), {
        position: "top-center",
      }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  if (targets.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {t("leg.statusMover.terminalState")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {targets.map((target) => {
        const checks = checkGates(deliveryOrder, target, t);
        const clientOk = checks.every((c) => c.ok);
        return (
          <div
            key={target}
            className="flex flex-col gap-1 rounded-md border p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">→ {target}</span>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => transition({ id: deliveryOrder.id, target })}
              >
                {isPending
                  ? t("leg.statusMover.transitingButton")
                  : t("leg.statusMover.transitButton")}
              </Button>
            </div>
            {checks.length > 0 && (
              <ul className="flex flex-col gap-0.5 text-xs">
                {checks.map((c, i) => (
                  <li
                    key={i}
                    className={c.ok ? "text-green-700" : "text-red-600"}
                  >
                    {c.ok ? "✓" : "✗"} {c.label}
                  </li>
                ))}
                {!clientOk && (
                  <li className="text-xs text-muted-foreground">
                    {t("leg.statusMover.serverNote")}
                  </li>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
