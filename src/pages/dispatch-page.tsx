// Dispatch Workspace — `?view=list|board|timeline|map` 4뷰. drawer 는 ?do=:id 동기화.
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import ContainerDrawer from "@/components/container/container-drawer";
import DeliveryOrderDrawer from "@/components/delivery-order/delivery-order-drawer";
import DispatchBoardView from "@/components/dispatch/dispatch-board-view";
import DispatchBoardViewV3 from "@/components/dispatch/dispatch-board-view-v3";
import DispatchListView from "@/components/dispatch/dispatch-list-view";
import DispatchListViewV3 from "@/components/dispatch/dispatch-list-view-v3";
import DispatchMapView from "@/components/dispatch/dispatch-map-view";
import DispatchMapViewV3 from "@/components/dispatch/dispatch-map-view-v3";
import DispatchTimelineView from "@/components/dispatch/dispatch-timeline-view";
import DispatchTimelineViewV3 from "@/components/dispatch/dispatch-timeline-view-v3";

type DispatchView =
  | "containers"
  | "container-board"
  | "container-timeline"
  | "container-map"
  | "list"
  | "board"
  | "timeline"
  | "map";
const VIEWS: DispatchView[] = [
  "containers",
  "container-board",
  "container-timeline",
  "container-map",
  "list",
  "board",
  "timeline",
  "map",
];

export default function DispatchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawView = searchParams.get("view");
  const view: DispatchView = (VIEWS as string[]).includes(rawView ?? "")
    ? (rawView as DispatchView)
    : "containers";

  const setView = (next: DispatchView) => {
    const params = new URLSearchParams(searchParams);
    if (next === "containers") params.delete("view");
    else params.set("view", next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("dispatch.workspace")}</h1>
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
                {t(`dispatch.view.${v}`)}
              </button>
            );
          })}
        </div>
      </div>

      {view === "containers" && <DispatchListViewV3 />}
      {view === "container-board" && <DispatchBoardViewV3 />}
      {view === "container-timeline" && <DispatchTimelineViewV3 />}
      {view === "container-map" && <DispatchMapViewV3 />}
      {view === "list" && <DispatchListView />}
      {view === "board" && <DispatchBoardView />}
      {view === "timeline" && <DispatchTimelineView />}
      {view === "map" && <DispatchMapView />}

      <DeliveryOrderDrawer />
      <ContainerDrawer />
    </div>
  );
}
