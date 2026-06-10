// Leg 카드 — segments 표시. 가장 정보 밀도 높은 곳.
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/lib/format";
import type { LegFullEntity } from "@/types";
import AddSegmentButton from "@/components/container-detail/add-segment-button";
import ReissueLegButton from "@/components/container-detail/reissue-leg-button";

export default function LegCard({
  leg,
  containerId,
}: {
  leg: LegFullEntity;
  containerId: number;
}) {
  const { t } = useTranslation();
  const canReissue = leg.status === "ASSIGNED" || leg.status === "IN_TRANSIT";

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
        {leg.moveCode && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {leg.moveCode}
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
            : t("container.leg.stopUnlinked")}
        </span>
        {leg.reissuedFromLegId !== null && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">
            {t("loadType.reissuedFrom", { id: leg.reissuedFromLegId })}
          </span>
        )}
        {canReissue && (
          <div className="ml-auto">
            <ReissueLegButton legId={leg.id} containerId={containerId} />
          </div>
        )}
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
          <div className="text-xs text-muted-foreground">{t("container.leg.noDriver")}</div>
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
                  {s.endedAt ? formatDateTime(s.endedAt) : t("container.leg.inProgress")}
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
