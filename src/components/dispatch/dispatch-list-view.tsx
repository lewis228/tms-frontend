// Dispatch 운영 list — D/O 마스터 list 와 유사하지만 driver/leg 정보 인라인 표시.
// 행 클릭 → URL ?do=:id (Drawer 가 open).
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
import StatusBadge from "@/components/delivery-order/status-badge";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useDeliveryOrdersData } from "@/hooks/queries/use-delivery-orders-data";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useOpenCreateDeliveryOrderModal } from "@/store/delivery-order-create-modal";
import { STATUS_ORDER } from "@/lib/delivery-order";
import { formatDateTime } from "@/lib/format";
import type { DeliveryOrderEntity, DeliveryStatus } from "@/types";

const STATUS_FILTER_OPTIONS: ("ALL" | DeliveryStatus)[] = [
  "ALL",
  ...STATUS_ORDER,
];

export default function DispatchListView() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | DeliveryStatus>(
    "ALL",
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("do");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, error } = useDeliveryOrdersData(page);
  const { data: customersData } = useCustomersData(1);
  const { data: driversData } = useDriversData(1);
  const openCreate = useOpenCreateDeliveryOrderModal();

  const customerNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of customersData?.items ?? []) m.set(c.id, c.name);
    return m;
  }, [customersData]);

  const driverNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of driversData?.items ?? []) m.set(d.id, d.name);
    return m;
  }, [driversData]);

  const filtered = useMemo<DeliveryOrderEntity[]>(() => {
    if (!data) return [];
    return data.items.filter((d) => {
      if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
      if (!search) return true;
      return (
        (d.containerNumber ?? "").toLowerCase().includes(search) ||
        (d.blNumber ?? "").toLowerCase().includes(search) ||
        (d.bookingNumber ?? "").toLowerCase().includes(search) ||
        (d.reference ?? "").toLowerCase().includes(search)
      );
    });
  }, [data, search, statusFilter]);

  const handleRowClick = (id: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("do", String(id));
    setSearchParams(next, { replace: true });
  };

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("deliveryOrder.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-72"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "ALL" | DeliveryStatus)
            }
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            {STATUS_FILTER_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? t("common.all") : s}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => openCreate()}>
          {t("deliveryOrder.newButton")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("deliveryOrder.table.status")}</TableHead>
              <TableHead>{t("deliveryOrder.table.direction")}</TableHead>
              <TableHead>{t("deliveryOrder.table.container")}</TableHead>
              <TableHead>{t("deliveryOrder.table.customer")}</TableHead>
              <TableHead>{t("deliveryOrder.table.bl")}</TableHead>
              <TableHead>{t("deliveryOrder.table.pickup")}</TableHead>
              <TableHead>{t("deliveryOrder.table.delivery")}</TableHead>
              <TableHead>{t("dispatch.list.headerGate")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => {
                const gateOk =
                  d.blReleased && d.pierPassPaid && d.customsCleared;
                return (
                  <TableRow
                    key={d.id}
                    onClick={() => handleRowClick(d.id)}
                    className={`cursor-pointer ${activeId === String(d.id) ? "bg-accent/40" : ""}`}
                  >
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {d.direction}
                    </TableCell>
                    <TableCell className="font-mono">
                      {d.containerNumber ?? "—"}
                    </TableCell>
                    <TableCell>
                      {customerNameById.get(d.customerId) ?? "—"}
                    </TableCell>
                    <TableCell>{d.blNumber ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {d.pickupAppointment
                        ? formatDateTime(d.pickupAppointment)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {d.deliveryAppointment
                        ? formatDateTime(d.deliveryAppointment)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className={gateOk ? "text-green-700" : "text-amber-700"}>
                        {[
                          d.blReleased ? "BL" : "·",
                          d.pierPassPaid ? "PP" : "·",
                          d.customsCleared ? "CC" : "·",
                        ].join("/")}
                      </span>
                      {!driverNameById.size && d.containerSize ? null : null}
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
          {t("common.pageOf", {
            page: data.page,
            pages: Math.max(1, data.pages),
          })}
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
