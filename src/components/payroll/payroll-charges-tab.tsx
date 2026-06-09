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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddPayrollCharge } from "@/hooks/mutations/payroll/use-add-payroll-charge";
import { formatAmount } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import type { PayrollChargeEntity } from "@/types";

export default function PayrollChargesTab({
  settlementId,
  charges,
  editable,
}: {
  settlementId: number;
  charges: PayrollChargeEntity[];
  editable: boolean;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const { mutate: addCharge, isPending: isAddChargePending } =
    useAddPayrollCharge({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        setCode("");
        setQuantity("1");
        setAmount("");
        setNote("");
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const canSave =
    code.trim() !== "" && amount.trim() !== "" && !isAddChargePending;

  const handleAdd = () => {
    if (!canSave) return;
    addCharge({
      id: settlementId,
      payload: {
        code: code.trim(),
        quantity: quantity.trim() || "1",
        amount: amount.trim(),
        note: note.trim() || null,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("payroll.charge.code")}</TableHead>
              <TableHead className="text-right">
                {t("payroll.charge.quantity")}
              </TableHead>
              <TableHead className="text-right">
                {t("payroll.charge.amount")}
              </TableHead>
              <TableHead>{t("payroll.charge.note")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground text-center"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              charges.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.code}</TableCell>
                  <TableCell className="text-right">{c.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatAmount(c.amount)}
                  </TableCell>
                  <TableCell>{c.note ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editable && (
        <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
          <div className="text-sm font-medium">{t("payroll.charge.add")}</div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs">
                {t("payroll.charge.code")}
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isAddChargePending}
                maxLength={48}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs">
                {t("payroll.charge.quantity")}
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isAddChargePending}
                className="w-28"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs">
                {t("payroll.charge.amount")}
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isAddChargePending}
                className="w-32"
              />
            </div>
            <div className="flex min-w-40 flex-1 flex-col gap-1">
              <label className="text-muted-foreground text-xs">
                {t("payroll.charge.note")}
              </label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isAddChargePending}
                maxLength={300}
              />
            </div>
            <Button onClick={handleAdd} disabled={!canSave}>
              {t("common.add")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
