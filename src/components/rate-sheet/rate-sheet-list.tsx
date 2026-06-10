import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { useRateSheetsData } from "@/hooks/queries/use-rate-sheets-data";
import { useRateGroupsData } from "@/hooks/queries/use-rate-groups-data";
import { useDeleteRateSheet } from "@/hooks/mutations/rate-sheet/use-delete-rate-sheet";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useOpenRateSheetCreateModal } from "@/store/rate-sheet-create-modal";
import type { RateSheetEntity } from "@/types";

export default function RateSheetList() {
  const { t } = useTranslation();
  const { teamId } = useParams();
  const [page, setPage] = useState(1);
  const [groupFilter, setGroupFilter] = useState<number | null>(null);

  const { data, isPending, error } = useRateSheetsData(
    page,
    groupFilter ?? undefined,
  );
  const { data: groupData } = useRateGroupsData(1);
  const openCreate = useOpenRateSheetCreateModal();
  const openAlert = useOpenAlertModal();

  const groupName = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    groupData?.items.forEach((g) => {
      map[g.id] = g.name;
    });
    return map;
  }, [groupData]);

  const { mutate: deleteRateSheet } = useDeleteRateSheet({
    onSuccess: () =>
      toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (v: RateSheetEntity) => {
    openAlert({
      title: t("rateSheet.deletePromptTitle"),
      description: t("rateSheet.deletePromptDesc"),
      onPositive: () => deleteRateSheet(v.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <select
          value={groupFilter ?? ""}
          onChange={(e) => {
            setGroupFilter(e.target.value ? Number(e.target.value) : null);
            setPage(1);
          }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("rateSheet.allGroups")}</option>
          {groupData?.items.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <Button onClick={() => openCreate()}>{t("rateSheet.newButton")}</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rateSheet.field.rateGroup")}</TableHead>
              <TableHead>{t("rateSheet.field.kind")}</TableHead>
              <TableHead>{t("rateSheet.field.moveType")}</TableHead>
              <TableHead>{t("rateSheet.field.serviceType")}</TableHead>
              <TableHead>{t("rateSheet.field.rowPoint")}</TableHead>
              <TableHead>{t("rateSheet.field.openEntryCount")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/app/${teamId}/rates/rate-sheets/${v.id}`}
                      className="text-primary hover:underline"
                    >
                      {groupName[v.rateGroupId] ?? `#${v.rateGroupId}`}
                    </Link>
                  </TableCell>
                  <TableCell>{t(`rateSheet.kind.${v.kind}`)}</TableCell>
                  <TableCell>
                    {v.moveType ? t(`rateSheet.moveType.${v.moveType}`) : "—"}
                  </TableCell>
                  <TableCell>
                    {v.serviceType
                      ? t(`rateSheet.serviceType.${v.serviceType}`)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {v.rowPointId != null ? `#${v.rowPointId}` : "—"}
                  </TableCell>
                  <TableCell>{v.openEntryCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/app/${teamId}/rates/rate-sheets/${v.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {t("common.open")}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(v)}
                    >
                      {t("common.delete")}
                    </Button>
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
