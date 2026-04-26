// Settlement 목록 — status 필터 + 검색 (legId, note) + 행 클릭 drawer.
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import SettlementStatusBadge from "@/components/settlement/settlement-status-badge";
import { useSettlementsData } from "@/hooks/queries/use-settlements-data";
import type { SettlementEntity } from "@/api/settlement";
import type { SettlementStatus } from "@/types";

const STATUS_OPTIONS: ("ALL" | SettlementStatus)[] = [
  "ALL",
  "PENDING",
  "CALCULATED",
  "ADJUSTED",
  "APPROVED",
];

export default function SettlementList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SettlementStatus>(
    "ALL",
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("settlement");

  useEffect(() => {
    const tm = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(tm);
  }, [searchInput]);

  const { data, isPending, error } = useSettlementsData(page, 100);

  const filtered = useMemo<SettlementEntity[]>(() => {
    if (!data) return [];
    return data.items.filter((s) => {
      if (statusFilter !== "ALL" && s.settlementStatus !== statusFilter)
        return false;
      if (!search) return true;
      return (
        String(s.legId).includes(search) ||
        (s.note ?? "").toLowerCase().includes(search)
      );
    });
  }, [data, search, statusFilter]);

  const handleRowClick = (id: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("settlement", String(id));
    setSearchParams(next, { replace: true });
  };

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t("settlement.filter.search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-72"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "ALL" | SettlementStatus)
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? t("settlement.filter.all") : s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("settlement.table.status")}</TableHead>
              <TableHead>{t("settlement.table.leg")}</TableHead>
              <TableHead className="text-right">
                {t("settlement.detail.systemTotalLabel")}
              </TableHead>
              <TableHead className="text-right">
                {t("settlement.detail.driverReportedLabel")}
              </TableHead>
              <TableHead className="text-right">
                {t("settlement.detail.discrepancyLabel")}
              </TableHead>
              <TableHead className="text-right">
                {t("settlement.table.finalAmount")}
              </TableHead>
              <TableHead>{t("settlement.table.flag")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow
                  key={s.id}
                  onClick={() => handleRowClick(s.id)}
                  className={`cursor-pointer ${activeId === String(s.id) ? "bg-accent/40" : ""}`}
                >
                  <TableCell>
                    <SettlementStatusBadge status={s.settlementStatus} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {String(s.legId).slice(0, 8)}…
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {s.systemTotal}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {s.driverReportedAmount ?? "—"}
                  </TableCell>
                  <TableCell
                    className={
                      "text-right font-mono " +
                      (s.discrepancy && s.discrepancy !== "0.00"
                        ? "text-amber-700"
                        : "")
                    }
                  >
                    {s.discrepancy ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {s.finalAmount ?? "—"}
                  </TableCell>
                  <TableCell>
                    {s.hasFlag ? (
                      <span className="text-amber-600">⚠</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("common.totalCount", { count: data.total })} · {data.page}/
          {Math.max(1, data.pages)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("common.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
