// 컨테이너 라이프사이클 이벤트 로그 (audit). GATE_OUT/IN/STREET_TURNED 등.
import { formatDateTime } from "@/lib/format";
import type { ContainerEventEntity } from "@/types";

export default function EventsPanel({
  events,
}: {
  events: ContainerEventEntity[];
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Events 없음
      </div>
    );
  }
  return (
    <div className="rounded-md border bg-card">
      <div className="border-b px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
        Events ({events.length})
      </div>
      <ul className="divide-y">
        {events.map((e) => (
          <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-xs">
            <span className="font-mono text-muted-foreground">
              {formatDateTime(e.occurredAt)}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              {e.eventKind}
            </span>
            {e.note && <span className="text-muted-foreground">— {e.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
