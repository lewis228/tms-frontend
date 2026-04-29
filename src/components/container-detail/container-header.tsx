// 컨테이너 상세 헤더 — Container No / Size / 소속 D/O / work_state / Demurrage / 현재 위치
import { Link, useParams } from "react-router-dom";

import { formatDateTime } from "@/lib/format";
import type { ContainerFullEntity, ContainerWorkState } from "@/types";

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

export default function ContainerHeader({
  full,
}: {
  full: ContainerFullEntity;
}) {
  const { teamId } = useParams();
  const c = full.container;
  const d = full.deliveryOrder;
  const state = (c.workState ?? "DRAFT") as ContainerWorkState;
  const tone = STATE_TONE[state] ?? STATE_TONE.DRAFT;
  const lastActualStop = [...full.stops]
    .reverse()
    .find((s) => s.actualArrival);
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-mono text-2xl font-semibold">
          {c.containerNumber ?? "—"}
        </h1>
        <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
          {c.size ?? "—"}
        </span>
        <span className={`rounded px-2 py-0.5 text-xs ${tone}`}>{state}</span>
        {c.moveTypeV3 && (
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {c.moveTypeV3}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Field label="B/L">
          {d.id ? (
            <Link
              to={`/app/${teamId}/delivery-orders/${d.id}`}
              className="font-mono text-blue-700 hover:underline"
            >
              {d.blNumber ?? `#${d.id}`}
            </Link>
          ) : (
            "—"
          )}
        </Field>
        <Field label="Customer">{d.customerName ?? "—"}</Field>
        <Field label="Direction">
          <span className="font-mono">{d.direction ?? "—"}</span>
        </Field>
        <Field label="Terminal">{d.terminalName ?? "—"}</Field>
        <Field label="Vessel">{d.vesselName ?? "—"}</Field>
        <Field label="Demurrage LFD">
          <span className="font-mono">{c.demurrageLfd ?? "—"}</span>
        </Field>
        <Field label="ETA">
          {d.eta ? formatDateTime(d.eta) : "—"}
        </Field>
        <Field label="Last actual">
          {lastActualStop
            ? `#${lastActualStop.sequenceNo} ${lastActualStop.locationName ?? "—"} · ${formatDateTime(lastActualStop.actualArrival!)}`
            : "—"}
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
