// Dual Transaction 목록 — 상태별 필터 + 완료/취소/삭제 액션.
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import DualTransactionStatusBadge from "@/components/dual-transaction/dual-transaction-status-badge";
import { useDualTransactionsData } from "@/hooks/queries/use-dual-transactions-data";
import { useCompleteDualTransaction } from "@/hooks/mutations/dual-transaction/use-complete-dual-transaction";
import { useCancelDualTransaction } from "@/hooks/mutations/dual-transaction/use-cancel-dual-transaction";
import { useDeleteDualTransaction } from "@/hooks/mutations/dual-transaction/use-delete-dual-transaction";
import { useOpenCreateDualTransactionModal } from "@/store/dual-transaction-create-modal";
import { generateErrorMessage } from "@/lib/error";
import { formatDateTime } from "@/lib/format";
import type { DualTransactionStatus } from "@/types";

const STATUS_FILTERS: Array<DualTransactionStatus | "ALL"> = [
  "ALL",
  "PLANNED",
  "COMPLETED",
  "CANCELLED",
];

export default function DualTransactionList() {
  const { t } = useTranslation();
  const openCreate = useOpenCreateDualTransactionModal();
  const [statusFilter, setStatusFilter] = useState<
    DualTransactionStatus | "ALL"
  >("ALL");
  const [page, setPage] = useState(1);

  const { data, isPending, error } = useDualTransactionsData(
    page,
    50,
    undefined,
    statusFilter === "ALL" ? undefined : statusFilter,
  );

  const { mutate: completeDualTransaction, isPending: isCompleteDualTransactionPending } =
    useCompleteDualTransaction({
      onSuccess: () =>
        toast.success(t("dualTransaction.toast.completed"), {
          position: "top-center",
        }),
      onError: (e) =>
        toast.error(generateErrorMessage(e), { position: "top-center" }),
    });
  const { mutate: cancelDualTransaction, isPending: isCancelDualTransactionPending } =
    useCancelDualTransaction({
      onSuccess: () =>
        toast.success(t("dualTransaction.toast.cancelled"), {
          position: "top-center",
        }),
      onError: (e) =>
        toast.error(generateErrorMessage(e), { position: "top-center" }),
    });
  const { mutate: deleteDualTransaction, isPending: isDeleteDualTransactionPending } =
    useDeleteDualTransaction({
      onSuccess: () =>
        toast.success(t("dualTransaction.toast.deleted"), {
          position: "top-center",
        }),
      onError: (e) =>
        toast.error(generateErrorMessage(e), { position: "top-center" }),
    });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const isMutating =
    isCompleteDualTransactionPending ||
    isCancelDualTransactionPending ||
    isDeleteDualTransactionPending;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
          >
            {t(`dualTransaction.filter.${s}`)}
          </Button>
        ))}
        <Button size="sm" className="ml-auto" onClick={() => openCreate()}>
          {t("dualTransaction.create")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dualTransaction.field.id")}</TableHead>
              <TableHead>{t("dualTransaction.field.driver")}</TableHead>
              <TableHead>{t("dualTransaction.field.returnLeg")}</TableHead>
              <TableHead>{t("dualTransaction.field.pickupLeg")}</TableHead>
              <TableHead>{t("dualTransaction.field.status")}</TableHead>
              <TableHead>{t("dualTransaction.field.scheduledAt")}</TableHead>
              <TableHead className="w-52 text-right" />
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
              data.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">#{row.id}</TableCell>
                  <TableCell className="text-xs">
                    {row.driverName ?? `#${row.driverId}`}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    #{row.returnLegId}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    #{row.pickupLegId}
                  </TableCell>
                  <TableCell>
                    <DualTransactionStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.scheduledAt ? formatDateTime(row.scheduledAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.status === "PLANNED" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isMutating}
                          onClick={() => completeDualTransaction(row.id)}
                        >
                          {t("dualTransaction.action.complete")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isMutating}
                          onClick={() => cancelDualTransaction(row.id)}
                        >
                          {t("dualTransaction.action.cancel")}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isMutating}
                      onClick={() => deleteDualTransaction(row.id)}
                    >
                      {t("dualTransaction.action.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} pages={data.pages} onChange={setPage} />
    </div>
  );
}

function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex justify-end gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </Button>
      <span className="px-2 py-1 text-xs text-muted-foreground">
        {page} / {pages}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </Button>
    </div>
  );
}
