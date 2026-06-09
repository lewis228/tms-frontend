import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import DetailLayout, { type DetailTab } from "@/components/detail-layout";
import { Button } from "@/components/ui/button";
import InvoiceStatusBadge from "@/components/invoice/invoice-status-badge";
import InvoiceLinesTab from "@/components/invoice/invoice-lines-tab";
import InvoiceInfoTab from "@/components/invoice/invoice-info-tab";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useTransitionInvoice } from "@/hooks/mutations/invoice/use-transition-invoice";
import { useDeleteInvoice } from "@/hooks/mutations/invoice/use-delete-invoice";
import { formatAmount } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type { InvoiceDetailEntity } from "@/types";

export default function InvoiceDetail({
  invoice,
}: {
  invoice: InvoiceDetailEntity;
}) {
  const { t } = useTranslation();
  const { teamId } = useParams();
  const navigate = useNavigate();
  const openAlert = useOpenAlertModal();
  const { data: customerData } = useCustomersData(1);

  const customerName = useMemo(() => {
    const found = customerData?.items.find((c) => c.id === invoice.customerId);
    return found?.name ?? `#${invoice.customerId}`;
  }, [customerData, invoice.customerId]);

  const onError = (err: Error) =>
    toast.error(generateErrorMessage(err), { position: "top-center" });
  const onSuccess = () =>
    toast.success(t("toast.updated"), { position: "top-center" });

  const { mutate: transitionInvoice, isPending: isTransitionInvoicePending } =
    useTransitionInvoice({ onSuccess, onError });
  const { mutate: deleteInvoice, isPending: isDeleteInvoicePending } =
    useDeleteInvoice({
      onSuccess: () => {
        toast.success(t("toast.deleted"), { position: "top-center" });
        navigate(`/app/${teamId}/billing/invoices`, { replace: true });
      },
      onError,
    });

  const isPending = isTransitionInvoicePending || isDeleteInvoicePending;

  const isDraft = invoice.status === "DRAFT";
  const isIssued = invoice.status === "ISSUED";
  const isVoid = invoice.status === "VOID";

  const handleDelete = () => {
    openAlert({
      title: t("invoice.deletePromptTitle"),
      description: t("invoice.deletePromptDesc"),
      onPositive: () => deleteInvoice(invoice.id),
    });
  };

  const margin = Number(invoice.margin);

  const actions = (
    <>
      {isDraft && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            transitionInvoice({ id: invoice.id, target: "ISSUED" })
          }
        >
          {t("invoice.action.issue")}
        </Button>
      )}
      {isIssued && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => transitionInvoice({ id: invoice.id, target: "PAID" })}
        >
          {t("invoice.action.markPaid")}
        </Button>
      )}
      {!isVoid && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => transitionInvoice({ id: invoice.id, target: "VOID" })}
        >
          {t("invoice.action.void")}
        </Button>
      )}
      {isDraft && (
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          disabled={isPending}
          onClick={handleDelete}
        >
          {t("common.delete")}
        </Button>
      )}
    </>
  );

  const tabs: DetailTab[] = [
    {
      value: "lines",
      label: t("invoice.tabs.lines"),
      content: (
        <InvoiceLinesTab
          invoiceId={invoice.id}
          lines={invoice.lines}
          editable={isDraft}
        />
      ),
    },
    {
      value: "info",
      label: t("invoice.tabs.info"),
      content: <InvoiceInfoTab invoice={invoice} editable={isDraft} />,
    },
  ];

  return (
    <DetailLayout
      title={customerName}
      subtitle={
        invoice.invoiceNumber
          ? `${t("invoice.field.invoiceNumber")}: ${invoice.invoiceNumber}`
          : undefined
      }
      badge={<InvoiceStatusBadge status={invoice.status} />}
      meta={
        <>
          <span>
            {t("invoice.field.costTotal")}: {formatAmount(invoice.costTotal)}
          </span>
          <span>
            {t("invoice.field.chargeTotal")}: {formatAmount(invoice.chargeTotal)}
          </span>
          <span
            className={
              "font-medium " +
              (margin > 0
                ? "text-green-600"
                : margin < 0
                  ? "text-destructive"
                  : "text-foreground")
            }
          >
            {t("invoice.field.margin")}: {formatAmount(invoice.margin)}
          </span>
        </>
      }
      actions={actions}
      tabs={tabs}
    />
  );
}
