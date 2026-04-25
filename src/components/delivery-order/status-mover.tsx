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
): GateCheck[] {
  const checks: GateCheck[] = [];
  if (d.status === "PLANNING" && target === "DISPATCHED") {
    checks.push({ ok: d.blReleased, label: "B/L Released" });
    checks.push({ ok: d.pierPassPaid, label: "Pier Pass Paid" });
    checks.push({ ok: d.customsCleared, label: "Customs Cleared" });
    checks.push({
      ok: !!d.pickupAppointment,
      label: "픽업 약속",
    });
    checks.push({ ok: true, label: "First Leg + driver/pickup_date (서버)" });
  }
  if (
    (d.status === "DISPATCHED" || d.status === "YARD_STAGED") &&
    target === "FINAL_DELIVERY"
  ) {
    checks.push({
      ok: !!d.deliveryAppointment,
      label: "배송 약속",
    });
    checks.push({ ok: true, label: "First Leg COMPLETED (서버)" });
  }
  if (target === "COMPLETED") {
    checks.push({ ok: !!d.returnLocationId, label: "반납 장소" });
    checks.push({ ok: !!d.returnAppointment, label: "반납 약속" });
    checks.push({ ok: !!d.detentionLfd, label: "Detention LFD" });
    if (d.direction === "IMPORT") {
      checks.push({ ok: !!d.emptyDate, label: "Empty 일자 (IMPORT)" });
    } else {
      checks.push({ ok: !!d.loadedDate, label: "Loaded 일자 (EXPORT)" });
    }
    checks.push({ ok: true, label: "반납 Leg COMPLETED (서버)" });
  }
  return checks;
}

export default function StatusMover({
  deliveryOrder,
}: {
  deliveryOrder: DeliveryOrderEntity;
}) {
  const targets = ALLOWED_TRANSITIONS[deliveryOrder.status];
  const { mutate: transition, isPending } = useTransitionDeliveryOrder({
    onSuccess: () =>
      toast.success("상태가 전이되었습니다.", { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  if (targets.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        최종 상태입니다. 추가 전이가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {targets.map((target) => {
        const checks = checkGates(deliveryOrder, target);
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
                {isPending ? "처리중..." : "전이"}
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
                    누락 항목이 있어도 시도 가능 — 서버가 최종 검증합니다.
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
