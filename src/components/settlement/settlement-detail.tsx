// Settlement Drawer 내용 — 기본 정보 + 액션 버튼 + extras + audit logs.
import { useTranslation } from "react-i18next";

import SettlementStatusBadge from "@/components/settlement/settlement-status-badge";
import { Button } from "@/components/ui/button";
import { useSettlementAuditLogsData } from "@/hooks/queries/use-settlement-audit-logs-data";
import { useSettlementExtrasData } from "@/hooks/queries/use-settlement-extras-data";
import { hasAccess } from "@/lib/nav-config";
import { formatDateTime } from "@/lib/format";
import { useCurrentRole } from "@/store/auth";
import {
  useOpenAdjustSettlement,
  useOpenApproveSettlement,
  useOpenCalculateSettlement,
  useOpenUnapproveSettlement,
} from "@/store/settlement-action-modal";
import type { SettlementEntity } from "@/api/settlement";

export default function SettlementDetail({
  settlement,
}: {
  settlement: SettlementEntity;
}) {
  const { t } = useTranslation();
  const role = useCurrentRole();
  const isAdmin = hasAccess(role, "ADMIN");

  const openCalculate = useOpenCalculateSettlement();
  const openAdjust = useOpenAdjustSettlement();
  const openApprove = useOpenApproveSettlement();
  const openUnapprove = useOpenUnapproveSettlement();

  const { data: extras } = useSettlementExtrasData(settlement.id);
  const { data: logs } = useSettlementAuditLogsData(settlement.id);

  const status = settlement.settlementStatus;
  const canCalculate = status === "PENDING" || status === "CALCULATED";
  const canAdjust = status === "CALCULATED" || status === "ADJUSTED";
  const canApprove = status === "CALCULATED" || status === "ADJUSTED";
  const canUnapprove = status === "APPROVED" && isAdmin;

  return (
    <div className="flex flex-col gap-5 pt-4">
      <Section title={t("settlement.detail.status")}>
        <div className="flex items-center gap-2">
          <SettlementStatusBadge status={status} />
          {settlement.isSettled && (
            <span className="text-xs text-green-700">
              {t("settlement.detail.settled")}
            </span>
          )}
          {settlement.hasFlag && (
            <span className="text-xs text-amber-600">
              ⚠ {t("settlement.detail.flagged")}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {canCalculate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCalculate(settlement.id)}
            >
              {t("settlement.detail.calculate")}
            </Button>
          )}
          {canAdjust && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAdjust(settlement.id)}
            >
              {t("settlement.detail.adjust")}
            </Button>
          )}
          {canApprove && (
            <Button size="sm" onClick={() => openApprove(settlement.id)}>
              {t("settlement.detail.approve")}
            </Button>
          )}
          {canUnapprove && (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive text-destructive"
              onClick={() => openUnapprove(settlement.id)}
            >
              {t("settlement.detail.unapprove")}
            </Button>
          )}
          {status === "APPROVED" && !isAdmin && (
            <span className="text-xs text-muted-foreground">
              {t("settlement.detail.approvedAdminOnly")}
            </span>
          )}
        </div>
      </Section>

      <Section title={t("settlement.detail.amounts")}>
        <Row
          label={t("settlement.detail.systemTotalLabel")}
          value={settlement.systemTotal}
          mono
        />
        <Row
          label={t("settlement.detail.driverReportedLabel")}
          value={settlement.driverReportedAmount ?? "—"}
          mono
        />
        <Row
          label={t("settlement.detail.discrepancyLabel")}
          value={settlement.discrepancy ?? "—"}
          mono
          tone={
            settlement.discrepancy && settlement.discrepancy !== "0.00"
              ? "warning"
              : undefined
          }
        />
        <Row
          label={t("settlement.detail.finalAmountLabel")}
          value={settlement.finalAmount ?? "—"}
          mono
          tone={settlement.isSettled ? "success" : undefined}
        />
      </Section>

      <Section
        title={t("settlement.detail.extraCharges", {
          count: extras?.length ?? 0,
        })}
      >
        {(extras ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t("settlement.detail.none")}
          </p>
        ) : (
          <div className="flex flex-col gap-1 text-sm">
            {(extras ?? []).map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-xs"
              >
                <span className="font-medium">{e.type}</span>
                <span className="ml-auto font-mono">{e.amount}</span>
                {e.description && (
                  <span className="text-muted-foreground">
                    · {e.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title={t("settlement.detail.auditLog", { count: logs?.length ?? 0 })}
      >
        {(logs ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t("settlement.detail.noLogs")}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {(logs ?? []).map((l) => (
              <div
                key={l.id}
                className="flex flex-col gap-0.5 rounded-md border bg-background px-2 py-1 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{l.action}</span>
                  <span className="ml-auto text-muted-foreground">
                    {formatDateTime(l.createdAt)}
                  </span>
                </div>
                {l.reason && (
                  <span className="text-muted-foreground">
                    {t("settlement.detail.reasonLabel", { reason: l.reason })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {settlement.unapprovedReason && (
        <Section title={t("settlement.detail.previousUnapprove")}>
          <Row
            label={t("settlement.detail.reasonField")}
            value={settlement.unapprovedReason}
            tone="warning"
          />
          {settlement.unapprovedAt && (
            <Row
              label={t("settlement.detail.atField")}
              value={formatDateTime(settlement.unapprovedAt)}
            />
          )}
        </Section>
      )}

      {settlement.note && (
        <Section title={t("settlement.detail.noteField")}>
          <p className="whitespace-pre-wrap text-sm">{settlement.note}</p>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-2 rounded-md border p-3">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "warning" | "success";
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-700"
      : tone === "success"
        ? "text-green-700 font-medium"
        : "";
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={(mono ? "font-mono " : "") + toneClass}>{value}</span>
    </div>
  );
}
