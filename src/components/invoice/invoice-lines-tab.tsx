import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddInvoiceLine } from "@/hooks/mutations/invoice/use-add-invoice-line";
import { useUpdateInvoiceLine } from "@/hooks/mutations/invoice/use-update-invoice-line";
import { useDeleteInvoiceLine } from "@/hooks/mutations/invoice/use-delete-invoice-line";
import { formatAmount } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import type { InvoiceLineEntity } from "@/types";

export default function InvoiceLinesTab({
  invoiceId,
  lines,
  editable,
}: {
  invoiceId: number;
  lines: InvoiceLineEntity[];
  editable: boolean;
}) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnitAmount, setEditUnitAmount] = useState("");

  const [newDescription, setNewDescription] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newUnitAmount, setNewUnitAmount] = useState("0");

  const onError = (err: Error) =>
    toast.error(generateErrorMessage(err), { position: "top-center" });

  const { mutate: addLine, isPending: isAddLinePending } = useAddInvoiceLine({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      setNewDescription("");
      setNewQuantity("1");
      setNewUnitAmount("0");
    },
    onError,
  });
  const { mutate: updateLine, isPending: isUpdateLinePending } =
    useUpdateInvoiceLine({
      onSuccess: () => {
        toast.success(t("toast.updated"), { position: "top-center" });
        setEditingId(null);
      },
      onError,
    });
  const { mutate: deleteLine, isPending: isDeleteLinePending } =
    useDeleteInvoiceLine({
      onSuccess: () =>
        toast.success(t("toast.deleted"), { position: "top-center" }),
      onError,
    });

  const isPending =
    isAddLinePending || isUpdateLinePending || isDeleteLinePending;

  const startEdit = (line: InvoiceLineEntity) => {
    setEditingId(line.id);
    setEditDescription(line.description);
    setEditQuantity(line.quantity);
    setEditUnitAmount(line.unitAmount);
  };

  const handleSaveEdit = (lineId: number) => {
    if (editDescription.trim() === "") return;
    updateLine({
      id: invoiceId,
      lineId,
      payload: {
        description: editDescription.trim(),
        quantity: editQuantity.trim() || "0",
        unitAmount: editUnitAmount.trim() || "0",
      },
    });
  };

  const handleAdd = () => {
    if (newDescription.trim() === "") return;
    addLine({
      id: invoiceId,
      payload: {
        description: newDescription.trim(),
        quantity: newQuantity.trim() || "1",
        unitAmount: newUnitAmount.trim() || "0",
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("invoice.line.description")}</TableHead>
              <TableHead className="text-right">
                {t("invoice.line.quantity")}
              </TableHead>
              <TableHead className="text-right">
                {t("invoice.line.unitAmount")}
              </TableHead>
              <TableHead className="text-right">
                {t("invoice.line.amount")}
              </TableHead>
              <TableHead className="text-right">
                {t("invoice.line.costAmount")}
              </TableHead>
              {editable && (
                <TableHead className="text-right">
                  {t("common.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={editable ? 6 : 5}
                  className="text-muted-foreground text-center"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line) => {
                const isEditing = editingId === line.id;
                return (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {line.source === "PREFILL" && (
                          <Badge variant="secondary">
                            {t("invoice.lineSource.PREFILL")}
                          </Badge>
                        )}
                        {isEditing ? (
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            disabled={isPending}
                            className="h-8"
                          />
                        ) : (
                          line.description
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          disabled={isPending}
                          className="h-8 w-24 text-right"
                        />
                      ) : (
                        line.quantity
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editUnitAmount}
                          onChange={(e) => setEditUnitAmount(e.target.value)}
                          disabled={isPending}
                          className="h-8 w-28 text-right"
                        />
                      ) : (
                        formatAmount(line.unitAmount)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatAmount(line.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">
                      {line.costAmount != null
                        ? formatAmount(line.costAmount)
                        : "—"}
                    </TableCell>
                    {editable && (
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleSaveEdit(line.id)}
                            >
                              {t("common.save")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isPending}
                              onClick={() => setEditingId(null)}
                            >
                              {t("common.cancel")}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isPending}
                              onClick={() => startEdit(line)}
                            >
                              {t("common.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={isPending}
                              onClick={() =>
                                deleteLine({ id: invoiceId, lineId: line.id })
                              }
                            >
                              {t("common.delete")}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editable && (
        <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
          <div className="text-sm font-medium">{t("invoice.line.add")}</div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-48 flex-1 flex-col gap-1">
              <label className="text-muted-foreground text-xs">
                {t("invoice.line.description")}
              </label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={isPending}
                maxLength={300}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs">
                {t("invoice.line.quantity")}
              </label>
              <Input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                disabled={isPending}
                className="w-28"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs">
                {t("invoice.line.unitAmount")}
              </label>
              <Input
                type="number"
                value={newUnitAmount}
                onChange={(e) => setNewUnitAmount(e.target.value)}
                disabled={isPending}
                className="w-32"
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={isPending || newDescription.trim() === ""}
            >
              {t("common.add")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
