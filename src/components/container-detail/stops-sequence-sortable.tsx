// 드래그&드롭으로 stop sequence_no 재정렬.
// dnd-kit + sortable.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { useReorderContainerStops } from "@/hooks/mutations/container-stop/use-reorder-container-stops";
import { formatDateTime } from "@/lib/format";
import type { ContainerStopEntity, PointType } from "@/types";

const TYPE_TONE: Record<PointType, string> = {
  TERMINAL: "bg-blue-100 text-blue-800",
  YARD: "bg-zinc-100 text-zinc-700",
  CUSTOMER: "bg-emerald-100 text-emerald-800",
};

export default function StopsSequenceSortable({
  containerId,
  stops,
}: {
  containerId: number;
  stops: ContainerStopEntity[];
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ContainerStopEntity[]>(stops);
  // server 가 새 데이터 보내면 동기화 — effect 대신 render 중 prev-prop 비교 reset (React 공식 패턴)
  const [prevStops, setPrevStops] = useState(stops);
  if (stops !== prevStops) {
    setPrevStops(stops);
    setItems(stops);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const { mutate: reorder } = useReorderContainerStops();

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((s) => s.id === Number(active.id));
    const newIdx = items.findIndex((s) => s.id === Number(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next); // optimistic
    reorder({
      containerId,
      items: next.map((s, i) => ({ stopId: s.id, sequenceNo: i + 1 })),
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        {t("container.stops.empty")}
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <div className="border-b px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
        Stops ({items.length}) — {t("container.stops.dragHint")}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="divide-y">
            {items.map((s, idx) => (
              <SortableRow key={s.id} stop={s} display={idx + 1} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({
  stop,
  display,
}: {
  stop: ContainerStopEntity;
  display: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id });
  const tone = TYPE_TONE[stop.pointType] ?? "bg-muted text-muted-foreground";
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? "rgba(0,0,0,0.04)" : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs"
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="drag"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="font-mono text-muted-foreground">#{display}</span>
      <span className={`rounded px-1.5 py-0.5 text-[10px] ${tone}`}>
        {stop.pointType}
      </span>
      <span className="font-medium">
        {stop.pointName ?? stop.locationName ?? "—"}
      </span>
      <span className="text-muted-foreground">
        {stop.plannedArrival ? `plan ${formatDateTime(stop.plannedArrival)}` : ""}
      </span>
      <span className="text-muted-foreground">
        {stop.actualArrival
          ? `actual ${formatDateTime(stop.actualArrival)}`
          : ""}
      </span>
    </li>
  );
}
