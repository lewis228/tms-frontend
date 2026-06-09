import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useRateSheetHistoryData } from "@/hooks/queries/use-rate-sheet-history-data";
import { formatDate, formatDateTime } from "@/lib/format";
import type { RateEntryHistoryEntity } from "@/types";

function columnLabel(h: RateEntryHistoryEntity): string {
  if (h.colZoneId != null) return `Zone #${h.colZoneId}`;
  if (h.colPointId != null) return `Point #${h.colPointId}`;
  if (h.colCity) return h.colState ? `${h.colCity}, ${h.colState}` : h.colCity;
  return "—";
}

export default function RateHistoryTable({ sheetId }: { sheetId: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useRateSheetHistoryData(sheetId);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("rateSheet.grid.column")}</TableHead>
            <TableHead>{t("rateSheet.history.action")}</TableHead>
            <TableHead>{t("rateSheet.history.oldAmount")}</TableHead>
            <TableHead>{t("rateSheet.history.newAmount")}</TableHead>
            <TableHead>{t("rateSheet.grid.effectiveFrom")}</TableHead>
            <TableHead>{t("rateSheet.grid.reason")}</TableHead>
            <TableHead>{t("rateSheet.history.createdAt")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                {t("common.noData")}
              </TableCell>
            </TableRow>
          ) : (
            data.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{columnLabel(h)}</TableCell>
                <TableCell>{h.action}</TableCell>
                <TableCell>{h.oldAmount ?? h.oldPerUnit ?? "—"}</TableCell>
                <TableCell>{h.newAmount ?? h.newPerUnit ?? "—"}</TableCell>
                <TableCell>
                  {h.effectiveFrom ? formatDate(h.effectiveFrom) : "—"}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {h.reason ?? "—"}
                </TableCell>
                <TableCell>
                  {h.createdAt ? formatDateTime(h.createdAt) : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
