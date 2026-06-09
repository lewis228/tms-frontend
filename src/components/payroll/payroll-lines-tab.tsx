import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, formatDate } from "@/lib/format";
import type { PayrollLineEntity } from "@/types";

export default function PayrollLinesTab({
  lines,
}: {
  lines: PayrollLineEntity[];
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("payroll.line.legId")}</TableHead>
            <TableHead>{t("payroll.line.workDate")}</TableHead>
            <TableHead>{t("payroll.line.source")}</TableHead>
            <TableHead className="text-right">
              {t("payroll.line.baseAmount")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground text-center"
              >
                {t("common.noData")}
              </TableCell>
            </TableRow>
          ) : (
            lines.map((line) => {
              const unresolved = line.source === "UNRESOLVED";
              return (
                <TableRow
                  key={line.id}
                  className={unresolved ? "bg-destructive/10" : undefined}
                >
                  <TableCell>
                    {line.legId != null ? `#${line.legId}` : "—"}
                  </TableCell>
                  <TableCell>
                    {line.workDate ? formatDate(line.workDate) : "—"}
                  </TableCell>
                  <TableCell
                    className={
                      unresolved ? "text-destructive font-medium" : undefined
                    }
                  >
                    {t(`payroll.lineSource.${line.source}`)}
                    {unresolved && line.message ? ` · ${line.message}` : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(line.baseAmount)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
