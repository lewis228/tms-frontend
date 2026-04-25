// D/O 상태 뱃지.
import { STATUS_COLOR } from "@/lib/delivery-order";
import type { DeliveryStatus } from "@/types";

export default function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[status]}`}
    >
      {status}
    </span>
  );
}
