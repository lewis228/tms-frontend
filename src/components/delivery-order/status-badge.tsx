// D/O 상태 뱃지.
import { useTranslation } from "react-i18next";

import { STATUS_COLOR, STATUS_LABEL } from "@/lib/delivery-order";
import type { DeliveryStatus } from "@/types";

export default function StatusBadge({ status }: { status: DeliveryStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[status]}`}
    >
      {t(`deliveryOrder.status.${status}`, { defaultValue: STATUS_LABEL[status] })}
    </span>
  );
}
