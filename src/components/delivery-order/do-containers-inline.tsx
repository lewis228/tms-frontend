// D/O 행 expand 시 인라인으로 그 D/O 의 컨테이너들을 한 줄씩 표시.
// ste Shipments 페이지의 expand 패턴을 따른다.
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useContainersV3Data } from "@/hooks/queries/use-containers-v3-data";
import Loader from "@/components/loader";
import type { ContainerWorkState } from "@/types";

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

export default function DOContainersInline({
  deliveryOrderId,
}: {
  deliveryOrderId: number;
}) {
  const { t } = useTranslation();
  const { teamId } = useParams();
  const { data, isPending } = useContainersV3Data({
    deliveryOrderId,
    size: 50,
  });

  if (isPending) return <div className="px-3 py-2"><Loader /></div>;
  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-muted-foreground">
        {t("common.noData")}
      </div>
    );
  }

  return (
    <div className="divide-y border-y border-border/40">
      {items.map((c) => {
        const state = (c.workState ?? "DRAFT") as ContainerWorkState;
        const tone = STATE_TONE[state] ?? STATE_TONE.DRAFT;
        return (
          <Link
            key={c.id}
            to={`/app/${teamId}/containers/${c.id}`}
            className="flex items-center gap-4 px-6 py-2 text-xs hover:bg-accent/40"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono">{c.containerNumber ?? "—"}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              {c.size ?? "—"}
            </span>
            <span className={`rounded px-1.5 py-0.5 ${tone}`}>{state}</span>
            <span className="text-muted-foreground">
              {t("deliveryOrder.table.progress")}: {c.legsCompleted ?? 0}/
              {c.legsTotal ?? 0}
            </span>
            <span className="text-muted-foreground">
              {c.demurrageLfd ? `LFD ${c.demurrageLfd}` : ""}
            </span>
            <span className="ml-auto text-muted-foreground">
              {c.currentDriverName ?? "—"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
