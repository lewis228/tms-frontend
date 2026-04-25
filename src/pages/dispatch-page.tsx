// Dispatch Workspace — `?view=list|board|timeline|map` 4뷰. drawer 는 ?do=:id 동기화.
import { useSearchParams } from "react-router-dom";

import DeliveryOrderDrawer from "@/components/delivery-order/delivery-order-drawer";
import DispatchBoardView from "@/components/dispatch/dispatch-board-view";
import DispatchListView from "@/components/dispatch/dispatch-list-view";
import DispatchMapView from "@/components/dispatch/dispatch-map-view";
import DispatchTimelineView from "@/components/dispatch/dispatch-timeline-view";

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
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={
                  "rounded px-3 py-1 text-xs transition-colors " +
                  (active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50")
                }
              >
                {v === "list" && "List"}
                {v === "board" && "Board"}
                {v === "timeline" && "Timeline"}
                {v === "map" && "Map"}
              </button>
            );
          })}
        </div>
      </div>

      {view === "list" && <DispatchListView />}
      {view === "board" && <DispatchBoardView />}
      {view === "timeline" && <DispatchTimelineView />}
      {view === "map" && <DispatchMapView />}

      <DeliveryOrderDrawer />
    </div>
  );
}
