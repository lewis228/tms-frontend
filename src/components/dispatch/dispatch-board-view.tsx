// Dispatch Board (Kanban) — status 6컬럼 + D/O 카드.
// 카드 클릭 → drawer (?do=:id). 카드 우측 화살표 → 다음 단계 transition (메모리: 드래그는 Phase 6+).
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isPending, error } = useDeliveryOrdersData(1);
  const { data: customersData } = useCustomersData(1);

  const { mutate: transition, isPending: isTransitionPending } =
    useTransitionDeliveryOrder({
      onSuccess: () =>
        toast.success("상태가 전이되었습니다.", { position: "top-center" }),
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const grouped = new Map<DeliveryStatus, DeliveryOrderEntity[]>();
  for (const s of STATUS_ORDER) grouped.set(s, []);
  for (const d of data.items) {
    grouped.get(d.status)?.push(d);
  }

  const customerName = (id: string) =>
    customersData?.items.find((c) => c.id === id)?.name ?? "—";

  const handleCardClick = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("do", id);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex h-[calc(100vh-220px)] gap-3 overflow-x-auto pb-2">
      {STATUS_ORDER.map((status) => {
        const items = grouped.get(status) ?? [];
        return (
          <div
            key={status}
            className="flex w-72 shrink-0 flex-col rounded-md border bg-muted/40"
          >
            <div className="flex items-center justify-between border-b bg-background px-3 py-2">
              <StatusBadge status={status} />
              <span className="text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto p-2">
              {items.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground">
                  비어있음
                </p>
              ) : (
                items.map((d) => {
                  const targets = ALLOWED_TRANSITIONS[d.status];
                  return (
                    <div
                      key={d.id}
                      className="flex flex-col gap-1 rounded-md border bg-background p-2 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleCardClick(d.id)}
                        className="text-left"
                      >
                        <div className="font-mono font-medium">
                          {d.containerNumber ?? "(컨테이너 미지정)"}
                        </div>
                        <div className="text-muted-foreground">
                          {customerName(d.customerId)} · {d.direction}
                        </div>
                        {d.blNumber && (
                          <div className="text-muted-foreground">
                            B/L {d.blNumber}
                          </div>
                        )}
                      </button>
                      {targets.length > 0 && (
                        <div className="flex flex-wrap gap-1 border-t pt-1">
                          {targets.map((t) => (
                            <Button
                              key={t}
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px]"
                              disabled={isTransitionPending}
                              onClick={() =>
                                transition({ id: d.id, target: t })
                              }
                            >
                              → {t}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
