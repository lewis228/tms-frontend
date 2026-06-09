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
import PayrollStatusBadge from "@/components/payroll/payroll-status-badge";
import { usePayrollsData } from "@/hooks/queries/use-payrolls-data";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { formatAmount, formatDate } from "@/lib/format";
import type { PayrollStatus } from "@/types";

const STATUSES: PayrollStatus[] = ["DRAFT", "CONFIRMED", "PAID", "VOID"];

export default function SettlementList() {
  const { t } = useTranslation();
  const { teamId } = useParams();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PayrollStatus | "">("");

  const { data, isPending, error } = usePayrollsData(
    page,
    undefined,
    statusFilter || undefined,
  );
  const { data: driverData } = useDriversData(1);

  const driverName = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    driverData?.items.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [driverData]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as PayrollStatus | "");
            setPage(1);
          }}
          className="bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">{t("payroll.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`payroll.status.${s}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("payroll.field.driver")}</TableHead>
              <TableHead>{t("payroll.field.period")}</TableHead>
              <TableHead>{t("payroll.field.status")}</TableHead>
              <TableHead className="text-right">
                {t("payroll.field.grandTotal")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
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
                      to={`/app/${teamId}/billing/settlements/${v.id}`}
                      className="text-primary hover:underline"
                    >
                      {driverName[v.driverId] ?? `#${v.driverId}`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatDate(v.periodStart)} – {formatDate(v.periodEnd)}
                  </TableCell>
                  <TableCell>
                    <PayrollStatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(v.grandTotal)}
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
