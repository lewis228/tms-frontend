// Dispatch Workspace — `?view=list|board` 로 뷰 전환. drawer 는 ?do=:id 로 같이 동작.
// Phase 5b 에서 timeline / map 추가 예정.
import { useSearchParams } from "react-router-dom";

import DeliveryOrderDrawer from "@/components/delivery-order/delivery-order-drawer";
import DispatchBoardView from "@/components/dispatch/dispatch-board-view";
import DispatchListView from "@/components/dispatch/dispatch-list-view";

type DispatchView = "list" | "board" | "timeline" | "map";
const VIEWS: DispatchView[] = ["list", "board", "timeline", "map"];

export default function DispatchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawView = searchParams.get("view");
  const view: DispatchView = (VIEWS as string[]).includes(rawView ?? "")
    ? (rawView as DispatchView)
    : "list";

  const setView = (next: DispatchView) => {
    const params = new URLSearchParams(searchParams);
    if (next === "list") params.delete("view");
    else params.set("view", next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dispatch Workspace</h1>
        <div className="flex gap-1 rounded-md border p-0.5">
          {VIEWS.map((v) => {
            const active = view === v;
            const disabled = v === "timeline" || v === "map";
            return (
              <button
                key={v}
                type="button"
                onClick={() => !disabled && setView(v)}
                disabled={disabled}
                className={
                  "rounded px-3 py-1 text-xs transition-colors " +
                  (active
                    ? "bg-accent text-accent-foreground font-medium"
                    : disabled
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:bg-accent/50")
                }
              >
                {v === "list" && "List"}
                {v === "board" && "Board"}
                {v === "timeline" && "Timeline (5b)"}
                {v === "map" && "Map (5b)"}
              </button>
            );
          })}
        </div>
      </div>

      {view === "list" && <DispatchListView />}
      {view === "board" && <DispatchBoardView />}

      <DeliveryOrderDrawer />
    </div>
  );
}
