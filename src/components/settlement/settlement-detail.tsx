// Settlement Drawer 내용 — 기본 정보 + 액션 버튼 + extras + audit logs.
import SettlementStatusBadge from "@/components/settlement/settlement-status-badge";
import { Button } from "@/components/ui/button";
import { useSettlementAuditLogsData } from "@/hooks/queries/use-settlement-audit-logs-data";
import { useSettlementExtrasData } from "@/hooks/queries/use-settlement-extras-data";
import { hasAccess } from "@/lib/nav-config";
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
      <Section title="상태">
        <div className="flex items-center gap-2">
          <SettlementStatusBadge status={status} />
          {settlement.isSettled && (
            <span className="text-xs text-green-700">(정산 완료)</span>
          )}
          {settlement.hasFlag && (
            <span className="text-xs text-amber-600">⚠ Flagged</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {canCalculate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCalculate(settlement.id)}
            >
              Calculate
            </Button>
          )}
          {canAdjust && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAdjust(settlement.id)}
            >
              Adjust
            </Button>
          )}
          {canApprove && (
            <Button size="sm" onClick={() => openApprove(settlement.id)}>
              Approve
            </Button>
          )}
          {canUnapprove && (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive text-destructive"
              onClick={() => openUnapprove(settlement.id)}
            >
              Unapprove (ADMIN+)
            </Button>
          )}
          {status === "APPROVED" && !isAdmin && (
            <span className="text-xs text-muted-foreground">
              승인됨 — Unapprove 는 ADMIN+ 권한
            </span>
          )}
        </div>
      </Section>

      <Section title="금액">
        <Row label="System Total" value={settlement.systemTotal} mono />
        <Row
          label="Driver Reported"
          value={settlement.driverReportedAmount ?? "—"}
          mono
        />
        <Row
          label="Discrepancy"
          value={settlement.discrepancy ?? "—"}
          mono
          tone={
            settlement.discrepancy && settlement.discrepancy !== "0.00"
              ? "warning"
              : undefined
          }
        />
        <Row
          label="Final Amount"
          value={settlement.finalAmount ?? "—"}
          mono
          tone={settlement.isSettled ? "success" : undefined}
        />
      </Section>

      <Section title={`Extra Charges (${extras?.length ?? 0})`}>
        {(extras ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">없음</p>
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

      <Section title={`Audit Log (${logs?.length ?? 0})`}>
        {(logs ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">기록 없음</p>
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
                    {new Date(l.createdAt).toLocaleString("ko-KR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {l.reason && (
                  <span className="text-muted-foreground">
                    이유: {l.reason}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {settlement.unapprovedReason && (
        <Section title="이전 Unapprove">
          <Row
            label="Reason"
            value={settlement.unapprovedReason}
            tone="warning"
          />
          {settlement.unapprovedAt && (
            <Row
              label="At"
              value={new Date(settlement.unapprovedAt).toLocaleString("ko-KR")}
            />
          )}
        </Section>
      )}

      {settlement.note && (
        <Section title="Note">
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
