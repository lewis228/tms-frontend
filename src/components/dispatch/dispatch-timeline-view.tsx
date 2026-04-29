// ⚠️ DEPRECATED (Phase v3): D/O 단위 타임라인. v3 는 dispatch-timeline-view-v3 (컨테이너 단위 leg 막대).
//
// Dispatch Timeline — 오늘 ±3일 (7일) 가로 시간축, 각 D/O 가 1행.
//
// 점:
// - 픽업 약속 (파랑)
// - 배송 약속 (보라)
// - 반납 약속 (주황)
// 점 간 bar: pickup→delivery, delivery→return (각 약속이 모두 있을 때만).
//
// 7일 범위 밖이거나 약속 미정인 D/O 는 상단 "미정 / 범위 밖" 영역에 별도 표시.
// 행 클릭 → drawer (?do=:id).
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import StatusBadge from "@/components/delivery-order/status-badge";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useDeliveryOrdersData } from "@/hooks/queries/use-delivery-orders-data";
import { formatShortDate } from "@/lib/format";
import type { DeliveryOrderEntity } from "@/types";

const DAYS_BEFORE = 3;
const DAYS_AFTER = 3;
const TOTAL_DAYS = DAYS_BEFORE + 1 + DAYS_AFTER;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function DispatchTimelineView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isPending, error } = useDeliveryOrdersData(1);
  const { data: customersData } = useCustomersData(1);

  const range = useMemo(() => {
    const today = startOfDay(new Date());
    const start = new Date(today);
    start.setDate(start.getDate() - DAYS_BEFORE);
    const end = new Date(today);
    end.setDate(end.getDate() + DAYS_AFTER);
    end.setHours(23, 59, 59, 999);
    const days: Date[] = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return { start, end, days };
  }, []);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const customerName = (id: number) =>
    customersData?.items.find((c) => c.id === id)?.name ?? "—";

  // H-1: 일정 컬럼이 컨테이너로 이전. 헤더 단계에선 ETA 만 사용.
  const inRange: DeliveryOrderEntity[] = [];
  const outRange: DeliveryOrderEntity[] = [];
  for (const d of data.items) {
    const dt = d.eta ? new Date(d.eta) : null;
    if (dt && dt >= range.start && dt <= range.end) inRange.push(d);
    else outRange.push(d);
  }

  const handleRowClick = (id: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("do", String(id));
    setSearchParams(next, { replace: true });
  };

  // x 좌표 계산 (0~1).
  const fraction = (iso: string | null): number | null => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    const startT = range.start.getTime();
    const endT = range.end.getTime();
    if (t < startT || t > endT) return null;
    return (t - startT) / (endT - startT);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 범위 밖/미정 D/O */}
      {outRange.length > 0 && (
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("dispatch.timeline.outOfRange", { count: outRange.length })}
          </div>
          <div className="flex flex-wrap gap-2">
            {outRange.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleRowClick(d.id)}
                className="flex items-center gap-2 rounded border bg-background px-2 py-1 text-xs hover:bg-accent/50"
              >
                <StatusBadge status={d.status} />
                <span>{d.blNumber ?? `#${d.id}`}</span>
                <span className="text-muted-foreground">
                  {customerName(d.customerId)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 시간축 헤더 + 행 */}
      <div className="rounded-md border">
        <div className="grid grid-cols-[200px_1fr] border-b bg-muted/40">
          <div className="border-r px-3 py-2 text-xs font-semibold text-muted-foreground">
            {t("dispatch.timeline.headerDo")}
          </div>
          <div className="grid grid-cols-7 text-center text-xs">
            {range.days.map((d, i) => {
              const isToday = i === DAYS_BEFORE;
              return (
                <div
                  key={d.toISOString()}
                  className={
                    "border-l px-1 py-2 " +
                    (isToday ? "bg-blue-50 font-medium" : "")
                  }
                >
                  {formatShortDate(d)}
                </div>
              );
            })}
          </div>
        </div>

        {inRange.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            {t("dispatch.timeline.noInRange")}
          </div>
        ) : (
          inRange.map((d) => (
            <TimelineRow
              key={d.id}
              d={d}
              customerName={customerName(d.customerId)}
              fraction={fraction}
              onClick={() => handleRowClick(d.id)}
            />
          ))
        )}
      </div>

      <div className="flex gap-3 text-xs text-muted-foreground">
        <Legend color="bg-blue-500" label={t("dispatch.timeline.legendPickup")} />
        <Legend
          color="bg-violet-500"
          label={t("dispatch.timeline.legendDelivery")}
        />
        <Legend
          color="bg-orange-500"
          label={t("dispatch.timeline.legendReturn")}
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function TimelineRow({
  d,
  customerName,
  fraction,
  onClick,
}: {
  d: DeliveryOrderEntity;
  customerName: string;
  fraction: (iso: string | null) => number | null;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const ef = fraction(d.eta);
  const pf = ef;
  const df = ef;
  const rf = ef;

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[200px_1fr] border-b text-left last:border-b-0 hover:bg-accent/30"
    >
      <div className="flex items-center gap-2 border-r px-3 py-2 text-xs">
        <StatusBadge status={d.status} />
        <div className="flex flex-col">
          <span className="font-medium">{d.blNumber ?? `#${d.id}`}</span>
          <span className="text-muted-foreground">{customerName}</span>
        </div>
      </div>
      <div className="relative h-12">
        {/* 일 단위 격자 */}
        <div className="absolute inset-0 grid grid-cols-7">
          {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
            <div
              key={i}
              className={
                "border-l " + (i === DAYS_BEFORE ? "bg-blue-50/40" : "")
              }
            />
          ))}
        </div>
        {/* bar: pickup→delivery */}
        {pf !== null && df !== null && df > pf && (
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 bg-blue-200"
            style={{
              left: `${pf * 100}%`,
              width: `${(df - pf) * 100}%`,
            }}
          />
        )}
        {/* bar: delivery→return */}
        {df !== null && rf !== null && rf > df && (
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 bg-orange-200"
            style={{
              left: `${df * 100}%`,
              width: `${(rf - df) * 100}%`,
            }}
          />
        )}
        {/* points */}
        {pf !== null && (
          <Dot
            left={pf}
            color="bg-blue-500"
            title={t("dispatch.timeline.tooltipPickup")}
          />
        )}
        {df !== null && (
          <Dot
            left={df}
            color="bg-violet-500"
            title={t("dispatch.timeline.tooltipDelivery")}
          />
        )}
        {rf !== null && (
          <Dot
            left={rf}
            color="bg-orange-500"
            title={t("dispatch.timeline.tooltipReturn")}
          />
        )}
      </div>
    </button>
  );
}

function Dot({
  left,
  color,
  title,
}: {
  left: number;
  color: string;
  title: string;
}) {
  return (
    <span
      title={title}
      className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${color}`}
      style={{ left: `${left * 100}%` }}
    />
  );
}
