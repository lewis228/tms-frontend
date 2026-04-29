// v3 Dispatch Timeline — 컨테이너 단위 Gantt.
// 행 = 컨테이너. 가로축 = 7일 (오늘 ±3). leg 가 시간 막대로 status 색 표시.
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useContainersV3Data } from "@/hooks/queries/use-containers-v3-data";
import { fetchContainerFull } from "@/api/container-v3";
import { useQueries } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import type { ContainerListEntity, LegFullEntity } from "@/types";

const DAYS_BEFORE = 3;
const DAYS_AFTER = 3;
const TOTAL_DAYS = DAYS_BEFORE + 1 + DAYS_AFTER;
const ROW_HEIGHT = 28;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#a1a1aa",
  IN_TRANSIT: "#f59e0b",
  COMPLETED: "#10b981",
  FAILED: "#ef4444",
  DRY_RUN: "#a78bfa",
};

export default function DispatchTimelineViewV3() {
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
    return { start, end, days, totalMs: end.getTime() - start.getTime() };
  }, []);

  const { data, isPending, error } = useContainersV3Data({ size: 50 });

  // 컨테이너별 full 응답을 병렬 fetch (Legs 시간 데이터 필요).
  const containers = useMemo<ContainerListEntity[]>(() => {
    return (data?.items ?? []).filter((c) => c.legsTotal && c.legsTotal > 0);
  }, [data]);

  const fullQueries = useQueries({
    queries: containers.map((c) => ({
      queryKey: QUERY_KEYS.containerV3.full(c.id),
      queryFn: () => fetchContainerFull(c.id),
      staleTime: 30_000,
    })),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const pctFor = (iso: string | null) => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    if (t < range.start.getTime() || t > range.end.getTime()) return null;
    return ((t - range.start.getTime()) / range.totalMs) * 100;
  };

  const todayPct = pctFor(new Date().toISOString());

  return (
    <div className="flex flex-col gap-2">
      {/* 헤더 */}
      <div className="rounded-md border bg-card">
        <div className="flex border-b text-xs">
          <div className="w-48 shrink-0 border-r px-3 py-2 font-semibold">
            Container ({containers.length})
          </div>
          <div className="relative flex-1">
            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${TOTAL_DAYS}, 1fr)` }}>
              {range.days.map((d, i) => {
                const isToday =
                  startOfDay(d).getTime() === startOfDay(new Date()).getTime();
                return (
                  <div
                    key={i}
                    className={`border-r px-2 py-2 text-center text-[11px] ${
                      isToday ? "bg-amber-50 font-semibold" : ""
                    }`}
                  >
                    {d.getMonth() + 1}/{d.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 본문 */}
        {containers.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            진행 중인 컨테이너 없음
          </div>
        ) : (
          containers.map((c, idx) => {
            const full = fullQueries[idx]?.data;
            const legs = full?.legs ?? [];
            return (
              <div
                key={c.id}
                className="flex border-b last:border-b-0 hover:bg-accent/30"
                style={{ height: ROW_HEIGHT }}
              >
                <Link
                  to={`/app/operations/containers/${c.id}`}
                  className="flex w-48 shrink-0 items-center gap-2 border-r px-3 text-xs"
                >
                  <span className="font-mono">{c.containerNumber ?? "—"}</span>
                  <span className="rounded bg-muted px-1 py-0.5 font-mono text-[9px]">
                    {c.size ?? ""}
                  </span>
                </Link>
                <div className="relative flex-1">
                  {/* 일별 grid 배경 */}
                  <div
                    className="absolute inset-0 grid"
                    style={{ gridTemplateColumns: `repeat(${TOTAL_DAYS}, 1fr)` }}
                  >
                    {range.days.map((_, i) => (
                      <div key={i} className="border-r border-border/40" />
                    ))}
                  </div>
                  {/* leg 막대 */}
                  {legs.map((leg) => {
                    const startPct = pctFor(leg.startedAt ?? null);
                    const endPct = pctFor(
                      leg.completedAt ?? leg.arrivedAt ?? null,
                    );
                    if (startPct === null) return null;
                    const right = endPct === null ? Math.min(100, startPct + 4) : endPct;
                    if (right <= startPct) return null;
                    const color = STATUS_COLOR[leg.status] ?? "#a1a1aa";
                    return (
                      <LegBar
                        key={leg.id}
                        leg={leg}
                        startPct={startPct}
                        endPct={right}
                        color={color}
                      />
                    );
                  })}
                  {/* 오늘 표시선 */}
                  {todayPct !== null && (
                    <div
                      className="pointer-events-none absolute top-0 bottom-0 w-px bg-amber-500"
                      style={{ left: `${todayPct}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {Object.entries(STATUS_COLOR).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-3 rounded-sm"
              style={{ background: v }}
            />
            {k}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <span className="inline-block h-3 w-px bg-amber-500" />
          오늘
        </span>
      </div>
    </div>
  );
}

function LegBar({
  leg,
  startPct,
  endPct,
  color,
}: {
  leg: LegFullEntity;
  startPct: number;
  endPct: number;
  color: string;
}) {
  const dashed = leg.status === "IN_TRANSIT";
  return (
    <div
      className="absolute top-1/2 h-4 -translate-y-1/2 overflow-hidden rounded border border-white/40 text-[9px] text-white"
      style={{
        left: `${startPct}%`,
        width: `${Math.max(1, endPct - startPct)}%`,
        background: dashed
          ? `repeating-linear-gradient(45deg, ${color}, ${color} 6px, ${color}cc 6px, ${color}cc 12px)`
          : color,
      }}
      title={`Leg #${leg.id} · ${leg.status}${leg.driverName ? ` · ${leg.driverName}` : ""}`}
    >
      <span className="px-1 leading-4">
        {leg.driverName ?? `#${leg.id}`}
      </span>
    </div>
  );
}
