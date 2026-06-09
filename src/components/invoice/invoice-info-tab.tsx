import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateInvoice } from "@/hooks/mutations/invoice/use-update-invoice";
import { useRecomputeInvoiceCost } from "@/hooks/mutations/invoice/use-recompute-invoice-cost";
import { generateErrorMessage } from "@/lib/error";
import type { InvoiceDetailEntity } from "@/types";

export default function InvoiceInfoTab({
  invoice,
  editable,
}: {
  invoice: InvoiceDetailEntity;
  editable: boolean;
}) {
  const { t } = useTranslation();
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoiceNumber ?? "");
  const [issueDate, setIssueDate] = useState(invoice.issueDate ?? "");
  const [dueDate, setDueDate] = useState(invoice.dueDate ?? "");
  const [note, setNote] = useState(invoice.note ?? "");

  const onError = (err: Error) =>
    toast.error(generateErrorMessage(err), { position: "top-center" });

  const { mutate: updateInvoice, isPending: isUpdateInvoicePending } =
    useUpdateInvoice({
      onSuccess: () =>
        toast.success(t("toast.updated"), { position: "top-center" }),
      onError,
    });
  const { mutate: recomputeCost, isPending: isRecomputeCostPending } =
    useRecomputeInvoiceCost({
      onSuccess: () =>
        toast.success(t("toast.updated"), { position: "top-center" }),
      onError,
    });

  const isPending = isUpdateInvoicePending || isRecomputeCostPending;

  const handleSave = () => {
    updateInvoice({
      id: invoice.id,
      payload: {
        invoiceNumber: invoiceNumber.trim() || null,
        issueDate: issueDate || null,
        dueDate: dueDate || null,
        note: note.trim() || null,
      },
    });
  };

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Field label={t("invoice.field.invoiceNumber")}>
        <Input
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          disabled={!editable || isPending}
          maxLength={64}
        />
      </Field>
      <div className="flex gap-3">
        <Field label={t("invoice.field.issueDate")}>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            disabled={!editable || isPending}
          />
        </Field>
        <Field label={t("invoice.field.dueDate")}>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={!editable || isPending}
          />
        </Field>
      </div>
      <Field label={t("field.note")}>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={!editable || isPending}
          maxLength={500}
        />
      </Field>
      {editable && (
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isPending}>
            {t("common.save")}
          </Button>
          <Button
            variant="outline"
            onClick={() => recomputeCost(invoice.id)}
            disabled={isPending}
          >
            {t("invoice.recomputeCost")}
          </Button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <label className="text-muted-foreground text-xs">{label}</label>
      {children}
    </div>
  );
}
