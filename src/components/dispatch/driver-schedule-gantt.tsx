// Driver Schedule Gantt — 행=driver, 컬럼=오늘 ±3일 7일, bar=assigned legs.
//
// bar 는 leg.pickup_date ~ leg.delivery_date. 한쪽만 있으면 단일 점.
// bar 클릭 → leg-editor-modal (EDIT).
//
// 백엔드 driver filter 없어 클라가 useLegsData(size=100) 받아 driver 별로 그루핑.
import { useMemo } from "react";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useLegsData } from "@/hooks/queries/use-legs-data";
import { useOpenEditLegModal } from "@/store/leg-editor-modal";
import type { DriverEntity, LegEntity, LegStatus } from "@/types";

const DAYS_BEFORE = 3;
const DAYS_AFTER = 3;
const TOTAL_DAYS = DAYS_BEFORE + 1 + DAYS_AFTER;

const LEG_STATUS_COLOR: Record<LegStatus, string> = {
  PENDING: "bg-slate-400",
  IN_TRANSIT: "bg-blue-500",
  COMPLETED: "bg-green-500",
  FAILED: "bg-red-500",
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function DriverScheduleGantt() {
  const {
    data: legsData,
    isPending: legsPending,
    error: legsError,
  } = useLegsData(1, 100);
  const {
    data: driversData,
    isPending: driversPending,
    error: driversError,
  } = useDriversData(1);
  const openEdit = useOpenEditLegModal();

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

  const legsByDriver = useMemo(() => {
    const m = new Map<string, LegEntity[]>();
    if (!legsData) return m;
    for (const leg of legsData.items) {
      if (!leg.driverId) continue;
      const arr = m.get(leg.driverId) ?? [];
      arr.push(leg);
      m.set(leg.driverId, arr);
    }
    return m;
  }, [legsData]);

  if (legsError || driversError) return <Fallback />;
  if (legsPending || driversPending) return <Loader />;

  const activeDrivers = (driversData?.items ?? []).filter((d) => d.isActive);

  // 0~1 fraction (해당 시각이 range 안인지). null = 범위 밖.
  const fraction = (iso: string | null): number | null => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    const startT = range.start.getTime();
    const endT = range.end.getTime();
    if (t < startT || t > endT) return null;
    return (t - startT) / (endT - startT);
  };

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-[200px_1fr] border-b bg-muted/40">
        <div className="border-r px-3 py-2 text-xs font-semibold text-muted-foreground">
          기사 ({activeDrivers.length})
        </div>
        <div className="grid grid-cols-7 text-center text-xs">
          {range.days.map((d, i) => (
            <div
              key={d.toISOString()}
              className={
                "border-l px-1 py-2 " +
                (i === DAYS_BEFORE ? "bg-blue-50 font-medium" : "")
              }
            >
              {d.toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}
            </div>
          ))}
        </div>
      </div>

      {activeDrivers.length === 0 ? (
        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
          활성 기사가 없습니다.
        </div>
      ) : (
        activeDrivers.map((driver) => (
          <DriverRow
            key={driver.id}
            driver={driver}
            legs={legsByDriver.get(driver.id) ?? []}
            fraction={fraction}
            onLegClick={(leg) => openEdit(leg)}
          />
        ))
      )}
    </div>
  );
}

function DriverRow({
  driver,
  legs,
  fraction,
  onLegClick,
}: {
  driver: DriverEntity;
  legs: LegEntity[];
  fraction: (iso: string | null) => number | null;
  onLegClick: (leg: LegEntity) => void;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] border-b last:border-b-0">
      <div className="flex items-center gap-2 border-r px-3 py-3 text-xs">
        <div className="flex flex-col">
          <span className="font-medium">{driver.name}</span>
          <span className="text-muted-foreground">
            {driver.truckNumber ?? "—"} · {legs.length} legs
          </span>
        </div>
      </div>
      <div className="relative h-14">
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
        {legs.map((leg) => {
          const pf = fraction(leg.pickupDate);
          const df = fraction(leg.deliveryDate);
          // 둘 다 없으면 표시 안 함 (범위 밖).
          if (pf === null && df === null) return null;
          // 한 쪽만 있으면 점.
          if (pf !== null && df === null) {
            return (
              <button
                key={leg.id}
                type="button"
                onClick={() => onLegClick(leg)}
                title={`${leg.step} · ${leg.status}`}
                className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${LEG_STATUS_COLOR[leg.status]}`}
                style={{ left: `${pf * 100}%` }}
              />
            );
          }
          if (df !== null && pf === null) {
            return (
              <button
                key={leg.id}
                type="button"
                onClick={() => onLegClick(leg)}
                title={`${leg.step} · ${leg.status}`}
                className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${LEG_STATUS_COLOR[leg.status]}`}
                style={{ left: `${df * 100}%` }}
              />
            );
          }
          // 둘 다 있고 df > pf 면 bar.
          if (pf !== null && df !== null && df > pf) {
            return (
              <button
                key={leg.id}
                type="button"
                onClick={() => onLegClick(leg)}
                title={`${leg.step} · ${leg.status}`}
                className={`absolute top-1/2 h-4 -translate-y-1/2 rounded ${LEG_STATUS_COLOR[leg.status]} text-[10px] text-white`}
                style={{
                  left: `${pf * 100}%`,
                  width: `${(df - pf) * 100}%`,
                }}
              >
                <span className="block truncate px-1">{leg.step}</span>
              </button>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
