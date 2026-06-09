import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { PayrollStatus } from "@/types";

const VARIANT: Record<
  PayrollStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  CONFIRMED: "secondary",
  PAID: "default",
  VOID: "destructive",
};

export default function PayrollStatusBadge({
  status,
}: {
  status: PayrollStatus;
}) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[status]}>{t(`payroll.status.${status}`)}</Badge>
  );
}
