// Street Turn 목록 — 상태별 필터 + 승인/거절/취소 액션.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useStreetTurnsData } from "@/hooks/queries/use-street-turns-data";
import { useApproveStreetTurn } from "@/hooks/mutations/street-turn/use-approve-street-turn";
import { useRejectStreetTurn } from "@/hooks/mutations/street-turn/use-reject-street-turn";
import { generateErrorMessage } from "@/lib/error";
import { formatDateTime } from "@/lib/format";
import type { StreetTurnEntity, StreetTurnStatus } from "@/types";

const STATUS_FILTERS: Array<StreetTurnStatus | "ALL"> = [
  "ALL",
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

type ActionState =
  | { mode: "CLOSED" }
  | { mode: "APPROVE"; row: StreetTurnEntity }
  | { mode: "REJECT"; row: StreetTurnEntity };

export default function StreetTurnList() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StreetTurnStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<ActionState>({ mode: "CLOSED" });

  const { data, isPending, error } = useStreetTurnsData(
    page,
    50,
    statusFilter === "ALL" ? undefined : statusFilter,
  );

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

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
            {t(`streetTurn.filter.${s}`)}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          {t("streetTurn.totalCount", { count: data.total ?? data.items.length })}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("streetTurn.field.id")}</TableHead>
              <TableHead>{t("streetTurn.field.status")}</TableHead>
              <TableHead>{t("streetTurn.field.linkType")}</TableHead>
              <TableHead>{t("streetTurn.field.containerNumber")}</TableHead>
              <TableHead>{t("streetTurn.field.importOrderId")}</TableHead>
              <TableHead>{t("streetTurn.field.exportOrderId")}</TableHead>
              <TableHead>{t("streetTurn.field.requestedAt")}</TableHead>
              <TableHead>{t("streetTurn.field.carrierApprovalNo")}</TableHead>
              <TableHead className="w-44 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">#{row.id}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-xs">{row.linkType}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.containerNumber ?? `#${row.containerId ?? "—"}`}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.importOrderId}</TableCell>
                  <TableCell className="font-mono text-xs">{row.exportOrderId}</TableCell>
                  <TableCell className="text-xs">
                    {row.requestedAt ? formatDateTime(row.requestedAt) : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.carrierApprovalNo ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.status === "REQUESTED" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAction({ mode: "APPROVE", row })}
                        >
                          {t("streetTurn.action.approve")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAction({ mode: "REJECT", row })}
                        >
                          {t("streetTurn.action.reject")}
                        </Button>
                      </>
                    )}
                    {row.status === "REJECTED" && row.rejectedReason && (
                      <span className="text-xs text-destructive" title={row.rejectedReason}>
                        ⚠
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} pages={data.pages} onChange={setPage} />

      <ApproveDialog
        action={action}
        onClose={() => setAction({ mode: "CLOSED" })}
      />
      <RejectDialog
        action={action}
        onClose={() => setAction({ mode: "CLOSED" })}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: StreetTurnStatus }) {
  const cls =
    status === "APPROVED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "REJECTED"
        ? "bg-red-100 text-red-700"
        : status === "CANCELLED"
          ? "bg-muted text-muted-foreground"
          : "bg-amber-100 text-amber-800";
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs ${cls}`}>{status}</span>
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
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </Button>
      <span className="px-2 py-1 text-xs text-muted-foreground">
        {page} / {pages}
      </span>
      <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        ›
      </Button>
    </div>
  );
}

function ApproveDialog({
  action,
  onClose,
}: {
  action: ActionState;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isOpen = action.mode === "APPROVE";
  const [carrierApprovalNo, setCarrierApprovalNo] = useState("");

  const { mutate: approve, isPending: isApprovePending } = useApproveStreetTurn({
    onSuccess: () => {
      toast.success(t("streetTurn.toast.approved"), { position: "top-center" });
      setCarrierApprovalNo("");
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  const handleSubmit = () => {
    if (action.mode !== "APPROVE") return;
    approve({
      id: action.row.id,
      carrierApprovalNo: carrierApprovalNo.trim() || null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {t("streetTurn.approve.title")}
          </DialogTitle>
        </DialogHeader>
        {isOpen && action.mode === "APPROVE" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {t("streetTurn.approve.description", { id: action.row.id })}
            </p>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("streetTurn.field.carrierApprovalNo")}
              <Input
                value={carrierApprovalNo}
                onChange={(e) => setCarrierApprovalNo(e.target.value)}
                disabled={isApprovePending}
                placeholder="MSC-ST-2026-0042"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isApprovePending}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={isApprovePending}>
                {t("streetTurn.action.approve")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({
  action,
  onClose,
}: {
  action: ActionState;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isOpen = action.mode === "REJECT";
  const [reason, setReason] = useState("");

  const { mutate: reject, isPending: isRejectPending } = useRejectStreetTurn({
    onSuccess: () => {
      toast.success(t("streetTurn.toast.rejected"), { position: "top-center" });
      setReason("");
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  const handleSubmit = () => {
    if (action.mode !== "REJECT") return;
    if (reason.trim() === "") {
      toast.error(t("streetTurn.validation.reasonRequired"), { position: "top-center" });
      return;
    }
    reject({ id: action.row.id, reason: reason.trim() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {t("streetTurn.reject.title")}
          </DialogTitle>
        </DialogHeader>
        {isOpen && action.mode === "REJECT" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {t("streetTurn.reject.description", { id: action.row.id })}
            </p>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("streetTurn.field.rejectedReason")}
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isRejectPending}
                className="min-h-[80px] w-full rounded-md border bg-background p-2 text-sm"
                placeholder={t("streetTurn.reject.placeholder")}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isRejectPending}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={isRejectPending}>
                {t("streetTurn.action.reject")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
