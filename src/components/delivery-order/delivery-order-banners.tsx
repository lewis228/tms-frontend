// D/O 상태 배너 — CANCELLED / ON HOLD 시각 표시.
// cancelledAt 이 있으면 CANCELLED 배너 (취소 사유), isOnHold 면 ON HOLD 배너 (보류 사유).
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/lib/format";
import type { DeliveryOrderEntity } from "@/types";

export default function DeliveryOrderBanners({
  deliveryOrder,
}: {
  deliveryOrder: DeliveryOrderEntity;
}) {
  const { t } = useTranslation();

  const isCancelled = deliveryOrder.cancelledAt !== null;

  if (isCancelled) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
          {t("deliveryOrder.banner.cancelled")}
          <span className="font-normal text-red-600">
            {formatDateTime(deliveryOrder.cancelledAt)}
          </span>
        </div>
        {deliveryOrder.cancelReason && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-red-700/80">
            {deliveryOrder.cancelReason}
          </p>
        )}
      </div>
    );
  }

  if (deliveryOrder.isOnHold) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
        <div className="text-sm font-semibold text-amber-700">
          {t("deliveryOrder.banner.onHold")}
        </div>
        {deliveryOrder.holdReason && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-amber-700/80">
            {deliveryOrder.holdReason}
          </p>
        )}
      </div>
    );
  }

  return null;
}
