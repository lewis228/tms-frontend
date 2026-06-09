import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import InvoiceStatusBadge from "@/components/invoice/invoice-status-badge";
import { useInvoicesData } from "@/hooks/queries/use-invoices-data";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useOpenInvoiceCreateModal } from "@/store/invoice-create-modal";
import { formatAmount } from "@/lib/format";
import type { InvoiceStatus } from "@/types";

const STATUSES: InvoiceStatus[] = ["DRAFT", "ISSUED", "PAID", "VOID"];

export default function InvoiceList() {
  const { t } = useTranslation();
  const { teamId } = useParams();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");

  const { data, isPending, error } = useInvoicesData(
    page,
    undefined,
    statusFilter || undefined,
  );
  const { data: customerData } = useCustomersData(1);
  const openCreate = useOpenInvoiceCreateModal();

  const customerName = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    customerData?.items.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [customerData]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as InvoiceStatus | "");
            setPage(1);
          }}
          className="bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">{t("invoice.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`invoice.status.${s}`)}
            </option>
          ))}
        </select>
        <Button onClick={() => openCreate()}>{t("invoice.newButton")}</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("invoice.field.customer")}</TableHead>
              <TableHead>{t("invoice.field.invoiceNumber")}</TableHead>
              <TableHead>{t("invoice.field.deliveryOrder")}</TableHead>
              <TableHead>{t("invoice.field.status")}</TableHead>
              <TableHead className="text-right">
                {t("invoice.field.costTotal")}
              </TableHead>
              <TableHead className="text-right">
                {t("invoice.field.chargeTotal")}
              </TableHead>
              <TableHead className="text-right">
                {t("invoice.field.margin")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground text-center"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/app/${teamId}/billing/invoices/${v.id}`}
                      className="text-primary hover:underline"
                    >
                      {customerName[v.customerId] ?? `#${v.customerId}`}
                    </Link>
                  </TableCell>
                  <TableCell>{v.invoiceNumber ?? "—"}</TableCell>
                  <TableCell>
                    {v.deliveryOrderId != null ? `#${v.deliveryOrderId}` : "—"}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(v.costTotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(v.chargeTotal)}
                  </TableCell>
                  <TableCell
                    className={
                      "text-right " +
                      (Number(v.margin) > 0
                        ? "text-green-600"
                        : Number(v.margin) < 0
                          ? "text-destructive"
                          : "")
                    }
                  >
                    {formatAmount(v.margin)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("common.totalCount", { count: data.total })} ·{" "}
          {t("common.pageOf", {
            page: data.page,
            pages: Math.max(1, data.pages),
          })}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("common.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
