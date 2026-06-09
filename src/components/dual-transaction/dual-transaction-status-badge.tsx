// Dual Transaction 상태 배지.
import { useTranslation } from "react-i18next";

import type { DualTransactionStatus } from "@/types";

export default function DualTransactionStatusBadge({
  status,
}: {
  status: DualTransactionStatus;
}) {
  const { t } = useTranslation();
  const cls =
    status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "CANCELLED"
        ? "bg-muted text-muted-foreground"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs ${cls}`}>
      {t(`dualTransaction.status.${status}`)}
    </span>
  );
}
