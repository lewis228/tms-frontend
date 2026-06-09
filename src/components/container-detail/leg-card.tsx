// Leg 카드 — segments 표시. 가장 정보 밀도 높은 곳.
import { formatDateTime } from "@/lib/format";
import type { LegFullEntity } from "@/types";
import AddSegmentButton from "@/components/container-detail/add-segment-button";

export default function LegCard({
  leg,
  containerId,
}: {
  leg: LegFullEntity;
  containerId: number;
}) {
  return (
    <div className="rounded-md border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b px-3 py-2">
        <span className="font-mono text-sm font-semibold">Leg #{leg.id}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          {leg.status}
        </span>
        {leg.moveTypeV3 && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {leg.moveTypeV3}
          </span>
        )}
        {leg.serviceType && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {leg.serviceType}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {leg.fromStopId !== null && leg.toStopId !== null
            ? `#${leg.fromStopId} → #${leg.toStopId}`
            : "stop 미연결"}
        </span>
      </div>

      {/* Driver Segments */}
      <div className="px-3 py-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] uppercase text-muted-foreground">
            Driver Segments ({leg.segments.length})
          </span>
          <AddSegmentButton legId={leg.id} containerId={containerId} />
        </div>
        {leg.segments.length === 0 ? (
          <div className="text-xs text-muted-foreground">기사 미배정</div>
        ) : (
          <ul className="space-y-1 text-xs">
            {leg.segments.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-muted-foreground">
                  ({s.sequenceNo})
                </span>
                <span className="font-medium">{s.driverName ?? `Driver#${s.driverId}`}</span>
                <span className="text-muted-foreground">
                  {s.startedAt ? formatDateTime(s.startedAt) : "—"} →{" "}
                  {s.endedAt ? formatDateTime(s.endedAt) : "진행 중"}
                </span>
                {s.handoverReason && (
                  <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-800">
                    {s.handoverReason}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
