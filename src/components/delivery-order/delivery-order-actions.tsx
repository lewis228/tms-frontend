// D/O Hold/Unhold + Cancel 액션.
// - Hold 토글: isOnHold 면 "Release hold", 아니면 "Hold" (reason 입력 다이얼로그).
// - Cancel: 확인 + optional reason. cancelledAt 이 있으면 모든 액션 비활성화.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCancelDeliveryOrder } from "@/hooks/mutations/delivery-order/use-cancel-delivery-order";
import { useHoldDeliveryOrder } from "@/hooks/mutations/delivery-order/use-hold-delivery-order";
import { generateErrorMessage } from "@/lib/error";
import type { DeliveryOrderEntity } from "@/types";

type DialogMode = "HOLD" | "RELEASE" | "CANCEL" | null;

export default function DeliveryOrderActions({
  deliveryOrder,
}: {
  deliveryOrder: DeliveryOrderEntity;
}) {
  const { t } = useTranslation();

  const { mutate: holdDeliveryOrder, isPending: isHoldDeliveryOrderPending } =
    useHoldDeliveryOrder({
      onSuccess: () => {
        toast.success(t("deliveryOrder.actions.holdSuccess"), {
          position: "top-center",
        });
        setMode(null);
        setReason("");
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const {
    mutate: cancelDeliveryOrder,
    isPending: isCancelDeliveryOrderPending,
  } = useCancelDeliveryOrder({
    onSuccess: () => {
      toast.success(t("deliveryOrder.actions.cancelSuccess"), {
        position: "top-center",
      });
      setMode(null);
      setReason("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const [mode, setMode] = useState<DialogMode>(null);
  const [reason, setReason] = useState("");

  const isPending = isHoldDeliveryOrderPending || isCancelDeliveryOrderPending;
  const isCancelled = deliveryOrder.cancelledAt !== null;

  if (isCancelled) return null;

  const handleOpen = (next: Exclude<DialogMode, null>) => {
    setReason(next === "RELEASE" ? "" : reason);
    setMode(next);
  };

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (mode === "HOLD") {
      holdDeliveryOrder({
        id: deliveryOrder.id,
        onHold: true,
        reason: trimmed || undefined,
      });
    } else if (mode === "RELEASE") {
      holdDeliveryOrder({ id: deliveryOrder.id, onHold: false });
    } else if (mode === "CANCEL") {
      cancelDeliveryOrder({
        id: deliveryOrder.id,
        reason: trimmed || undefined,
      });
    }
  };

  const dialogTitle =
    mode === "HOLD"
      ? t("deliveryOrder.actions.holdTitle")
      : mode === "RELEASE"
        ? t("deliveryOrder.actions.releaseTitle")
        : t("deliveryOrder.actions.cancelTitle");

  const dialogDescription =
    mode === "HOLD"
      ? t("deliveryOrder.actions.holdDescription")
      : mode === "RELEASE"
        ? t("deliveryOrder.actions.releaseDescription")
        : t("deliveryOrder.actions.cancelDescription");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {deliveryOrder.isOnHold ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleOpen("RELEASE")}
          >
            {t("deliveryOrder.actions.releaseHold")}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleOpen("HOLD")}
          >
            {t("deliveryOrder.actions.hold")}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
          disabled={isPending}
          onClick={() => handleOpen("CANCEL")}
        >
          {t("deliveryOrder.actions.cancel")}
        </Button>
      </div>

      <Dialog
        open={mode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMode(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          {mode !== "RELEASE" && (
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              placeholder={t("deliveryOrder.actions.reasonPlaceholder")}
              rows={3}
            />
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => {
                setMode(null);
                setReason("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button disabled={isPending} onClick={handleConfirm}>
              {isPending
                ? t("deliveryOrder.actions.submitting")
                : t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
