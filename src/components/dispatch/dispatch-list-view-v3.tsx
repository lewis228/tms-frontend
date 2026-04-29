// v3 Dispatch List — 컨테이너 단위 (D/O 단위가 아님).
// 한 D/O 의 N개 컨테이너가 각각 한 행으로 나타남. work_state(8단계) / move_type / current driver / demurrage 인라인.
// 행 클릭 → /app/operations/containers/{id} 상세 페이지.
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useContainersV3Data } from "@/hooks/queries/use-containers-v3-data";
import type { ContainerWorkState } from "@/types";

const WORK_STATES: ("ALL" | ContainerWorkState)[] = [
  "ALL",
  "DRAFT",
  "PLANNED",
  "IN_TRANSIT",
  "AT_STOP",
  "WAITING_PLAN",
  "HOLD",
  "COMPLETED",
  "CANCELLED",
];

const STATE_TONE: Record<ContainerWorkState, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PLANNED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-amber-100 text-amber-800",
  AT_STOP: "bg-cyan-100 text-cyan-800",
  WAITING_PLAN: "bg-red-100 text-red-800",
  HOLD: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-zinc-100 text-zinc-700",
};

export default function DispatchListViewV3() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<"ALL" | ContainerWorkState>(
    "ALL",
  );

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isPending, error } = useContainersV3Data({ page, size: 50 });

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((c) => {
      if (stateFilter !== "ALL" && c.workState !== stateFilter) return false;
      if (!search) return true;
      return (
        (c.containerNumber ?? "").toLowerCase().includes(search) ||
        (c.blNumber ?? "").toLowerCase().includes(search) ||
        (c.bookingNumber ?? "").toLowerCase().includes(search) ||
        (c.customerName ?? "").toLowerCase().includes(search)
      );
    });
  }, [data, search, stateFilter]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t("deliveryOrder.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-72"
        />
        <select
          value={stateFilter}
          onChange={(e) =>
            setStateFilter(e.target.value as "ALL" | ContainerWorkState)
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {WORK_STATES.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? t("common.all") : s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Container</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>B/L</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Dir</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Move</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Demurrage</TableHead>
              <TableHead>Legs</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const state = (c.workState ?? "DRAFT") as ContainerWorkState;
                const tone = STATE_TONE[state] ?? STATE_TONE.DRAFT;
                return (
                  <TableRow key={c.id} className="hover:bg-accent/40">
                    <TableCell className="font-mono text-xs">
                      {c.containerNumber ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {c.size ?? "—"}
                    </TableCell>
                    <TableCell>{c.blNumber ?? "—"}</TableCell>
                    <TableCell>{c.customerName ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {c.direction ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] ${tone}`}>
                        {state}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {c.moveTypeV3 ?? "—"}
                    </TableCell>
                    <TableCell>{c.currentDriverName ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {c.demurrageLfd ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {c.legsCompleted ?? 0}/{c.legsTotal ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/app/operations/containers/${c.id}`}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {t("deliveryOrder.viewDetail")}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("common.totalCount", { count: data.total })} ·{" "}
          {t("common.pageOf", { page: data.page, pages: Math.max(1, data.pages) })}
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
