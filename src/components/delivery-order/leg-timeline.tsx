// Leg Timeline — D/O 의 legs 를 가로 step bar 로 표시.
// Phase 4 에서는 읽기만. driver assign / leg 생성은 Phase 5 (Dispatch Workspace).
import { useTranslation } from "react-i18next";

import Loader from "@/components/loader";
import { formatDateTime } from "@/lib/format";
import Fallback from "@/components/fallback";
import { useLegsByDoData } from "@/hooks/queries/use-legs-by-do-data";
import type { LegEntity, LegStatus } from "@/types";

const LEG_STATUS_COLOR: Record<LegStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  DRY_RUN: "bg-amber-100 text-amber-700",
};

export default function LegTimeline({
  deliveryOrderId,
}: {
  deliveryOrderId: number;
}) {
  const { t } = useTranslation();
  const { data, isPending, error } = useLegsByDoData(deliveryOrderId);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {t("leg.timeline.empty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((leg, i) => (
        <LegRow key={leg.id} leg={leg} index={i + 1} />
      ))}
    </div>
  );
}

function LegRow({ leg, index }: { leg: LegEntity; index: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 rounded-md border p-2 text-xs">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {index}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium">{leg.step}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {leg.moveType} / {leg.serviceType}
          </span>
          <span
            className={`ml-auto inline-flex items-center rounded-md px-2 py-0.5 text-[10px] ${LEG_STATUS_COLOR[leg.status]}`}
          >
            {leg.status}
          </span>
        </div>
        <div className="text-muted-foreground">
          {leg.driverId
            ? `${t("leg.timeline.driverPrefix")} ${String(leg.driverId).slice(0, 8)}…`
            : `${t("leg.timeline.driverPrefix")} ${t("common.none")}`}
          {leg.pickupDate
            ? ` · ${t("leg.timeline.pickupPrefix")} ${formatDateTime(leg.pickupDate)}`
            : ""}
          {leg.deliveryDate
            ? ` · ${t("leg.timeline.deliveryPrefix")} ${formatDateTime(leg.deliveryDate)}`
            : ""}
        </div>
        {leg.failureReason && (
          <div className="text-red-600">
            {t("leg.timeline.failurePrefix")} {leg.failureReason}
          </div>
        )}
      </div>
    </div>
  );
}
