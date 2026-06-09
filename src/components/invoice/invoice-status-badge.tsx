import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/types";

const VARIANT: Record<
  InvoiceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  ISSUED: "secondary",
  PAID: "default",
  VOID: "destructive",
};

export default function InvoiceStatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[status]}>{t(`invoice.status.${status}`)}</Badge>
  );
}
