// v3 Dispatch Board — Container work_state 8단계 칸반.
// 컨테이너 단위 카드 (D/O 단위가 아님). 클릭 → 컨테이너 상세.
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useContainersV3Data } from "@/hooks/queries/use-containers-v3-data";
import type { ContainerListEntity, ContainerWorkState } from "@/types";

const COLUMNS: { state: ContainerWorkState; tone: string; label: string }[] = [
  { state: "DRAFT", tone: "border-zinc-300", label: "DRAFT" },
  { state: "PLANNED", tone: "border-blue-400", label: "PLANNED" },
  { state: "IN_TRANSIT", tone: "border-amber-400", label: "IN TRANSIT" },
  { state: "AT_STOP", tone: "border-cyan-400", label: "AT STOP" },
  { state: "WAITING_PLAN", tone: "border-red-400", label: "WAITING PLAN ⚠️" },
  { state: "HOLD", tone: "border-orange-400", label: "HOLD" },
  { state: "COMPLETED", tone: "border-emerald-400", label: "COMPLETED" },
];

export default function DispatchBoardViewV3() {
  const { data, isPending, error } = useContainersV3Data({ size: 200 });

  const grouped = useMemo(() => {
    const m = new Map<ContainerWorkState, ContainerListEntity[]>();
    for (const col of COLUMNS) m.set(col.state, []);
    for (const c of data?.items ?? []) {
      const s = (c.workState ?? "DRAFT") as ContainerWorkState;
      const arr = m.get(s);
      if (arr) arr.push(c);
    }
    return m;
  }, [data]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {COLUMNS.map((col) => {
        const items = grouped.get(col.state) ?? [];
        return (
          <div
            key={col.state}
            className={`flex w-[260px] shrink-0 flex-col gap-2 rounded-md border-t-2 bg-card p-2 ${col.tone}`}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold">{col.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {items.length === 0 ? (
                <div className="rounded border border-dashed py-3 text-center text-xs text-muted-foreground">
                  비어있음
                </div>
              ) : (
                items.map((c) => (
                  <Link
                    key={c.id}
                    to={`/app/operations/containers/${c.id}`}
                    className="flex flex-col gap-1 rounded border bg-background p-2 text-xs hover:bg-accent/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">
                        {c.containerNumber ?? "—"}
                      </span>
                      <span className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                        {c.size ?? "—"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {c.blNumber ?? "—"} · {c.customerName ?? "—"}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{c.currentDriverName ?? "—"}</span>
                      <span className="font-mono">
                        {c.legsCompleted ?? 0}/{c.legsTotal ?? 0}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
