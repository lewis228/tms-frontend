// 컨테이너 stop 시퀀스 — sequence 순 카드. plan/actual 시각.
import { formatDateTime } from "@/lib/format";
import type { ContainerStopEntity, StopRole } from "@/types";

const ROLE_TONE: Record<StopRole, string> = {
  ORIGIN: "bg-blue-100 text-blue-800",
  DELIVERY: "bg-emerald-100 text-emerald-800",
  TRANSIT: "bg-zinc-100 text-zinc-700",
  TERMINUS: "bg-slate-200 text-slate-800",
};

export default function StopsSequence({
  stops,
}: {
  stops: ContainerStopEntity[];
}) {
  if (stops.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        아직 stop 이 없습니다.
      </div>
    );
  }
  return (
    <div className="rounded-md border bg-card">
      <div className="border-b px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
        Stops ({stops.length})
      </div>
      <ol className="divide-y">
        {stops.map((s) => {
          const tone = ROLE_TONE[s.role] ?? "bg-muted text-muted-foreground";
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs">
              <span className="font-mono text-muted-foreground">#{s.sequenceNo}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] ${tone}`}>
                {s.role}
              </span>
              <span className="font-medium">{s.locationName ?? "—"}</span>
              <span className="text-muted-foreground">
                {s.plannedArrival ? `plan ${formatDateTime(s.plannedArrival)}` : ""}
              </span>
              <span className="text-muted-foreground">
                {s.actualArrival ? `actual ${formatDateTime(s.actualArrival)}` : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
