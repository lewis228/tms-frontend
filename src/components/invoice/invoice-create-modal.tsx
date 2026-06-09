import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { fetchCustomer, fetchCustomers } from "@/api/customer";
import { fetchDeliveryOrder, fetchDeliveryOrders } from "@/api/delivery-order";
import SearchableSelect from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateInvoice } from "@/hooks/mutations/invoice/use-create-invoice";
import { generateErrorMessage } from "@/lib/error";
import { useInvoiceCreateModal } from "@/store/invoice-create-modal";
import type {
  CustomerEntity,
  DeliveryOrderEntity,
  InvoiceDetailEntity,
} from "@/types";

const SEARCH_SIZE = 50;

export default function InvoiceCreateModal() {
  const modal = useInvoiceCreateModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {modal.isOpen && <Body onClose={() => modal.actions.close()} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [deliveryOrderId, setDeliveryOrderId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [prefillFromDo, setPrefillFromDo] = useState(true);

  const { mutate: createInvoice, isPending } = useCreateInvoice({
    onSuccess: (data: InvoiceDetailEntity) => {
      toast.success(t("toast.created"), { position: "top-center" });
      onClose();
      navigate(`/app/${teamId}/billing/invoices/${data.id}`);
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const canSave = customerId != null && !isPending;

  const handleSave = () => {
    if (customerId == null) return;
    createInvoice({
      customerId,
      deliveryOrderId: deliveryOrderId ?? null,
      invoiceNumber: invoiceNumber.trim() || null,
      issueDate: issueDate || null,
      dueDate: dueDate || null,
      prefillFromDo,
    });
  };

  const doLabel = (d: DeliveryOrderEntity) =>
    `#${d.id}${d.blNumber ? ` · ${d.blNumber}` : ""}`;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t("invoice.createTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("invoice.field.customer")} required>
          <SearchableSelect<CustomerEntity>
            value={customerId}
            onSelect={(id) => setCustomerId(id)}
            fetchList={(q) =>
              fetchCustomers({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchCustomer(id)}
            queryKeyBase={["customer", "search"]}
            getLabel={(c) => c.name}
            placeholder={t("invoice.customerPlaceholder")}
            disabled={isPending}
          />
        </Field>
        <Field label={t("invoice.field.deliveryOrder")}>
          <SearchableSelect<DeliveryOrderEntity>
            value={deliveryOrderId}
            onSelect={(id) => setDeliveryOrderId(id)}
            fetchList={() =>
              fetchDeliveryOrders({ size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchDeliveryOrder(id)}
            queryKeyBase={["delivery-order", "search"]}
            getLabel={doLabel}
            placeholder={t("invoice.deliveryOrderPlaceholder")}
            emptyLabel={t("common.noSelection")}
            disabled={isPending}
          />
        </Field>
        <Field label={t("invoice.field.invoiceNumber")}>
          <Input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            disabled={isPending}
            maxLength={64}
          />
        </Field>
        <div className="flex gap-3">
          <Field label={t("invoice.field.issueDate")}>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("invoice.field.dueDate")}>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isPending}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={prefillFromDo}
            onCheckedChange={setPrefillFromDo}
            disabled={isPending}
          />
          {t("invoice.prefillFromDo")}
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          {t("common.create")}
        </Button>
      </div>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <label className="text-muted-foreground text-xs">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
