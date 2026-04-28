// Dispatch Board (Kanban) — status 6컬럼 + D/O 카드.
//
// 드래그 (dnd-kit):
//  - 카드를 다른 컬럼에 drop → transition mutation
//  - ALLOWED_TRANSITIONS 외 컬럼은 drop zone 빨간색 (drop 시 toast 차단)
//  - 422 (게이트 미충족) → toast + invalidate 로 카드 자동 복귀
//
// 카드 클릭 (드래그 8px 미만) → drawer.
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import StatusBadge from "@/components/delivery-order/status-badge";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useDeliveryOrdersData } from "@/hooks/queries/use-delivery-orders-data";
import { useTransitionDeliveryOrder } from "@/hooks/mutations/delivery-order/use-transition-delivery-order";
import { ALLOWED_TRANSITIONS, STATUS_ORDER } from "@/lib/delivery-order";
import { generateErrorMessage } from "@/lib/error";
import type { DeliveryOrderEntity, DeliveryStatus } from "@/types";

export default function DispatchBoardView() {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const { data, isPending, error } = useDeliveryOrdersData(1);
  const { data: customersData } = useCustomersData(1);

  const { mutate: transition } = useTransitionDeliveryOrder({
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  // 드래그 임계점 — 클릭과 드래그 구분 (8px 이상 움직여야 drag).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const grouped = new Map<DeliveryStatus, DeliveryOrderEntity[]>();
  for (const s of STATUS_ORDER) grouped.set(s, []);
  for (const d of data.items) grouped.get(d.status)?.push(d);

  const customerName = (id: number) =>
    customersData?.items.find((c) => c.id === id)?.name ?? "—";

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const orderId = Number(active.id);
    const target = String(over.id) as DeliveryStatus;
    const order = data.items.find((d) => d.id === orderId);
    if (!order) return;
    if (order.status === target) return;
    if (!ALLOWED_TRANSITIONS[order.status].includes(target)) {
      toast.error(
        t("dispatch.board.blocked", { from: order.status, to: target }),
        {
          position: "top-center",
        },
      );
      return;
    }
    transition({ id: orderId, target });
  };

  const openDrawer = (id: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("do", String(id));
      return next;
    }, { replace: true });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-220px)] gap-3 overflow-x-auto pb-2">
        {STATUS_ORDER.map((status) => {
          const items = grouped.get(status) ?? [];
          return (
            <BoardColumn
              key={status}
              status={status}
              items={items}
              customerName={customerName}
              onCardClick={openDrawer}
            />
          );
        })}
      </div>
    </DndContext>
  );
}

function BoardColumn({
  status,
  items,
  customerName,
  onCardClick,
}: {
  status: DeliveryStatus;
  items: DeliveryOrderEntity[];
  customerName: (id: number) => string;
  onCardClick: (id: number) => void;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver, active } = useDroppable({ id: status });
  const activeStatus = (active?.data.current as { status?: DeliveryStatus } | undefined)
    ?.status;
  const allowed = activeStatus
    ? activeStatus === status ||
      ALLOWED_TRANSITIONS[activeStatus].includes(status)
    : true;

  let bg = "bg-muted/40";
  if (active) {
    if (!allowed) bg = "bg-red-50/60";
    else if (isOver) bg = "bg-green-50";
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-md border ${bg} transition-colors`}
    >
      <div className="flex items-center justify-between border-b bg-background px-3 py-2">
        <StatusBadge status={status} />
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-2">
        {items.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            {t("dispatch.board.empty")}
          </p>
        ) : (
          items.map((d) => (
            <BoardCard
              key={d.id}
              order={d}
              customerName={customerName(d.customerId)}
              onClick={() => onCardClick(d.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function BoardCard({
  order,
  customerName,
  onClick,
}: {
  order: DeliveryOrderEntity;
  customerName: string;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: order.id, data: { status: order.status } });
  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) onClick();
      }}
      className={
        "flex flex-col gap-1 rounded-md border bg-background p-2 text-xs " +
        (isDragging
          ? "opacity-50 cursor-grabbing"
          : "cursor-grab hover:border-foreground/30")
      }
    >
      <div className="font-medium">
        {order.blNumber ?? `#${order.id}`}
      </div>
      <div className="text-muted-foreground">
        {customerName} · {order.direction}
      </div>
      {order.bookingNumber && (
        <div className="text-muted-foreground">BKG {order.bookingNumber}</div>
      )}
    </div>
  );
}
