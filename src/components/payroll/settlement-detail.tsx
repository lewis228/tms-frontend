import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import DetailLayout, { type DetailTab } from "@/components/detail-layout";
import { Button } from "@/components/ui/button";
import PayrollStatusBadge from "@/components/payroll/payroll-status-badge";
import PayrollLinesTab from "@/components/payroll/payroll-lines-tab";
import PayrollChargesTab from "@/components/payroll/payroll-charges-tab";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useConfirmPayroll } from "@/hooks/mutations/payroll/use-confirm-payroll";
import { useMarkPayrollPaid } from "@/hooks/mutations/payroll/use-mark-payroll-paid";
import { useVoidPayroll } from "@/hooks/mutations/payroll/use-void-payroll";
import { useDeletePayroll } from "@/hooks/mutations/payroll/use-delete-payroll";
import { formatAmount, formatDate } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type { PayrollDetailEntity } from "@/types";

export default function SettlementDetail({
  settlement,
}: {
  settlement: PayrollDetailEntity;
}) {
  const { t } = useTranslation();
  const { teamId } = useParams();
  const navigate = useNavigate();
  const openAlert = useOpenAlertModal();
  const { data: driverData } = useDriversData(1);

  const driverName = useMemo(() => {
    const found = driverData?.items.find((d) => d.id === settlement.driverId);
    return found?.name ?? `#${settlement.driverId}`;
  }, [driverData, settlement.driverId]);

  const onError = (err: Error) =>
    toast.error(generateErrorMessage(err), { position: "top-center" });
  const onSuccess = () =>
    toast.success(t("toast.updated"), { position: "top-center" });

  const { mutate: confirmPayroll, isPending: isConfirmPayrollPending } =
    useConfirmPayroll({ onSuccess, onError });
  const { mutate: markPayrollPaid, isPending: isMarkPayrollPaidPending } =
    useMarkPayrollPaid({ onSuccess, onError });
  const { mutate: voidPayroll, isPending: isVoidPayrollPending } =
    useVoidPayroll({ onSuccess, onError });
  const { mutate: deletePayroll, isPending: isDeletePayrollPending } =
    useDeletePayroll({
      onSuccess: () => {
        toast.success(t("toast.deleted"), { position: "top-center" });
        navigate(`/app/${teamId}/billing/settlements`, { replace: true });
      },
      onError,
    });

  const isPending =
    isConfirmPayrollPending ||
    isMarkPayrollPaidPending ||
    isVoidPayrollPending ||
    isDeletePayrollPending;

  const handleDelete = () => {
    openAlert({
      title: t("payroll.deletePromptTitle"),
      description: t("payroll.deletePromptDesc"),
      onPositive: () => deletePayroll(settlement.id),
    });
  };

  const isDraft = settlement.status === "DRAFT";
  const isConfirmed = settlement.status === "CONFIRMED";
  const isVoid = settlement.status === "VOID";

  const actions = (
    <>
      {isDraft && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => confirmPayroll(settlement.id)}
        >
          {t("payroll.action.confirm")}
        </Button>
      )}
      {isConfirmed && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => markPayrollPaid(settlement.id)}
        >
          {t("payroll.action.markPaid")}
        </Button>
      )}
      {!isVoid && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => voidPayroll(settlement.id)}
        >
          {t("payroll.action.void")}
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
      label: t("payroll.tabs.lines"),
      content: <PayrollLinesTab lines={settlement.lines} />,
    },
    {
      value: "charges",
      label: t("payroll.tabs.charges"),
      content: (
        <PayrollChargesTab
          settlementId={settlement.id}
          charges={settlement.charges}
          editable={isDraft}
        />
      ),
    },
  ];

  return (
    <DetailLayout
      title={driverName}
      subtitle={`${formatDate(settlement.periodStart)} – ${formatDate(
        settlement.periodEnd,
      )}`}
      badge={<PayrollStatusBadge status={settlement.status} />}
      meta={
        <>
          <span>
            {t("payroll.field.baseTotal")}: {formatAmount(settlement.baseTotal)}
          </span>
          <span>
            {t("payroll.field.addonTotal")}:{" "}
            {formatAmount(settlement.addonTotal)}
          </span>
          <span className="text-foreground font-medium">
            {t("payroll.field.grandTotal")}:{" "}
            {formatAmount(settlement.grandTotal)}
          </span>
        </>
      }
      actions={actions}
      tabs={tabs}
    />
  );
}
