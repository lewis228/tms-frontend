// Leg 카드 — segments + rate + charges 표시. 가장 정보 밀도 높은 곳.
import { formatAmount, formatDateTime } from "@/lib/format";
import type { LegFullEntity, LegRateSource } from "@/types";
import AddLegChargeButton from "@/components/container-detail/add-leg-charge-button";
import EditLegRateButton from "@/components/container-detail/edit-leg-rate-button";
import AddSegmentButton from "@/components/container-detail/add-segment-button";

const RATE_SOURCE_TONE: Record<LegRateSource, string> = {
  QUOTE_FIXED: "bg-violet-100 text-violet-800",
  TARIFF_CALC: "bg-blue-100 text-blue-800",
  TARIFF_FLAT: "bg-amber-100 text-amber-800",
  MANUAL: "bg-emerald-100 text-emerald-800",
  NONE: "bg-red-100 text-red-700",
};

export default function LegCard({
  leg,
  containerId,
}: {
  leg: LegFullEntity;
  containerId: number;
}) {
  const rate = leg.rate;
  const rateTone = rate ? RATE_SOURCE_TONE[rate.source] : RATE_SOURCE_TONE.NONE;
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
        <span className="ml-auto font-mono text-sm font-semibold">
          {formatAmount(Number(leg.legTotal))}
        </span>
      </div>

      {/* Driver Segments */}
      <div className="border-b px-3 py-2">
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

      {/* Rate */}
      <div className="border-b px-3 py-2">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10px] uppercase text-muted-foreground">
            Rate (base)
          </span>
          {rate && (
            <span className={`rounded px-1.5 py-0.5 text-[10px] ${rateTone}`}>
              {rate.source}
            </span>
          )}
          {rate?.manualOverride && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">
              override
            </span>
          )}
          <div className="ml-auto">
            <EditLegRateButton
              legId={leg.id}
              containerId={containerId}
              rate={rate}
            />
          </div>
        </div>
        {!rate ? (
          <div className="text-xs text-muted-foreground">계산되지 않음</div>
        ) : (
          <div className="text-xs">
            {rate.source === "TARIFF_CALC" && (
              <div className="text-muted-foreground">
                distance{" "}
                <span className="font-mono">{rate.snapshotDistanceValue}</span>{" "}
                × per_value{" "}
                <span className="font-mono">{rate.snapshotPerValue}</span>
                {rate.snapshotPerMin && Number(rate.snapshotPerMin) > 0 && (
                  <>
                    {" "}+ per_min ×{" "}
                    <span className="font-mono">{rate.snapshotDurationMin}</span>
                  </>
                )}
                {rate.snapshotFlatBase && Number(rate.snapshotFlatBase) > 0 && (
                  <>
                    {" "}+ flat{" "}
                    <span className="font-mono">{rate.snapshotFlatBase}</span>
                  </>
                )}
              </div>
            )}
            {rate.source === "QUOTE_FIXED" && (
              <div className="text-muted-foreground">
                정찰가 {rate.snapshotQuoteFixed}
              </div>
            )}
            <div className="mt-1 font-mono">
              = {formatAmount(Number(rate.baseAmount))} (snapshot)
            </div>
          </div>
        )}
      </div>

      {/* Charges */}
      <div className="px-3 py-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] uppercase text-muted-foreground">
            Charges ({leg.charges.length})
          </span>
          <AddLegChargeButton legId={leg.id} containerId={containerId} />
        </div>
        {leg.charges.length === 0 ? (
          <div className="text-xs text-muted-foreground">없음</div>
        ) : (
          <ul className="space-y-1 text-xs">
            {leg.charges.map((c) => {
              const sub = Number(c.subtotal);
              const tone = sub < 0 ? "text-red-700" : "";
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-muted-foreground">
                    {c.chargeCode ?? `#${c.chargeCodeId}`}
                  </span>
                  <span>{c.chargeName ?? ""}</span>
                  <span className="text-muted-foreground">
                    qty <span className="font-mono">{c.quantity ?? "—"}</span> ×{" "}
                    <span className="font-mono">{c.snapshotUnitAmount ?? "—"}</span>
                  </span>
                  <span className={`ml-auto font-mono ${tone}`}>
                    = {formatAmount(sub)}
                  </span>
                  {c.payeeDriverName && (
                    <span className="text-muted-foreground">
                      → {c.payeeDriverName}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
