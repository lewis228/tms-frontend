import type { SettlementStatus } from "@/types";

const COLOR: Record<SettlementStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  CALCULATED: "bg-blue-100 text-blue-700",
  ADJUSTED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
};

export default function SettlementStatusBadge({
  status,
}: {
  status: SettlementStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${COLOR[status]}`}
    >
      {status}
    </span>
  );
}
