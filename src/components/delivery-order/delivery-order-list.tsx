// D/O 목록.
// - 검색 (bl/booking/container/reference) 300ms debounce
// - 상태 필터 (전체/PLANNING/.../COMPLETED)
// - 행 클릭 → URL ?do=:id (Drawer 가 open)
// - 새 D/O 버튼 → 풀스크린 모달
import { useEffect, useMemo, useState } from "react";
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
import { useOpenCreateDeliveryOrderModal } from "@/store/delivery-order-create-modal";
import { useOpenAIIntakeModal } from "@/store/ai-intake-modal";
import { STATUS_ORDER } from "@/lib/delivery-order";
import type { DeliveryOrderEntity, DeliveryStatus } from "@/types";

const STATUS_FILTER_OPTIONS: ("ALL" | DeliveryStatus)[] = [
  "ALL",
  ...STATUS_ORDER,
];

export default function DeliveryOrderList() {
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
  const openCreate = useOpenCreateDeliveryOrderModal();
  const openAIIntake = useOpenAIIntakeModal();

  const customerNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of customersData?.items ?? []) m.set(c.id, c.name);
    return m;
  }, [customersData]);

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
            placeholder="컨테이너 / B/L / Booking / Reference"
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
                {s === "ALL" ? "전체" : s}
              </option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={() => openAIIntake()}>
          AI 로 등록
        </Button>
        <Button onClick={() => openCreate()}>새 D/O</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상태</TableHead>
              <TableHead>방향</TableHead>
              <TableHead>컨테이너</TableHead>
              <TableHead>고객사</TableHead>
              <TableHead>B/L</TableHead>
              <TableHead>픽업</TableHead>
              <TableHead>배송</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
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
                  <TableCell>
                    {d.pickupAppointment
                      ? new Date(d.pickupAppointment).toLocaleString("ko-KR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {d.deliveryAppointment
                      ? new Date(d.deliveryAppointment).toLocaleString(
                          "ko-KR",
                          { dateStyle: "short", timeStyle: "short" },
                        )
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          전체 {data.total}건 · {data.page}/{Math.max(1, data.pages)} 페이지
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
