import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AT_RISK_SHIPMENTS } from "@/components/dashboard/mock-dashboard";
import type {
  AtRiskShipment,
  RiskLevel,
} from "@/components/dashboard/mock-dashboard";

const LEVEL_STYLES: Record<RiskLevel, { labelKey: string; badge: string }> = {
  overdue: {
    labelKey: "pages.dashboard.atRisk.level.overdue",
    badge: "text-rose-700",
  },
  "at-risk": {
    labelKey: "pages.dashboard.atRisk.level.atRisk",
    badge: "text-amber-700",
  },
  attention: {
    labelKey: "pages.dashboard.atRisk.level.attention",
    badge: "text-sky-700",
  },
};

// Bottom table of the dashboard — mirrors the reference "Project
// Spendings" block but surfaces the shipments most likely to incur fees.
// Sorted naturally in the mock by worst-first (overdue → attention).
export default function AtRiskTable() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">
          {t("pages.dashboard.atRisk.title")}
        </h3>
        <span className="text-xs text-black/55">
          {t("pages.dashboard.atRisk.count", {
            count: AT_RISK_SHIPMENTS.length,
          })}
        </span>
      </header>

      <Table>
        <TableHeader>
          <TableRow className="border-b-black/10 hover:bg-transparent">
            <TableHead className="text-sm text-foreground">
              {t("pages.dashboard.atRisk.col.mbl")}
            </TableHead>
            <TableHead className="text-sm text-foreground">
              {t("pages.dashboard.atRisk.col.requester")}
            </TableHead>
            <TableHead className="text-sm text-foreground">
              {t("pages.dashboard.atRisk.col.eta")}
            </TableHead>
            <TableHead className="text-sm text-foreground">
              {t("pages.dashboard.atRisk.col.risk")}
            </TableHead>
            <TableHead className="text-sm text-foreground">
              {t("pages.dashboard.atRisk.col.status")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {AT_RISK_SHIPMENTS.map((s) => (
            <Row key={s.id} shipment={s} />
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function Row({ shipment: s }: { shipment: AtRiskShipment }) {
  const { t } = useTranslation();
  const level = LEVEL_STYLES[s.level];

  return (
    <TableRow className="border-b-black/[0.04] hover:bg-muted/30">
      <TableCell className="py-3 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-black/70"
            style={{ backgroundColor: s.carrierBadge }}
          >
            {s.carrierInitial}
          </span>
          {s.mbl}
        </div>
      </TableCell>
      <TableCell className="py-3 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <img
            src={s.requesterAvatar}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
          {s.requesterName}
        </div>
      </TableCell>
      <TableCell className="py-3 text-sm text-foreground">
        {s.etaLabel}
      </TableCell>
      <TableCell className="py-3 text-sm text-foreground">
        {s.riskDays < 0
          ? t("pages.dashboard.atRisk.overdueDays", { count: Math.abs(s.riskDays) })
          : t("pages.dashboard.atRisk.daysLeft", { count: s.riskDays })}
      </TableCell>
      <TableCell className="py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium",
            level.badge,
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              s.level === "overdue" && "bg-rose-500",
              s.level === "at-risk" && "bg-amber-500",
              s.level === "attention" && "bg-sky-500",
            )}
          />
          {t(level.labelKey)}
        </span>
      </TableCell>
    </TableRow>
  );
}
