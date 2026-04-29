// /app/operations/containers/:id — v3 컨테이너 상세
import { Navigate, useParams } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import ContainerHeader from "@/components/container-detail/container-header";
import StopsSequenceSortable from "@/components/container-detail/stops-sequence-sortable";
import LegCard from "@/components/container-detail/leg-card";
import EventsPanel from "@/components/container-detail/events-panel";
import AddStopButton from "@/components/container-detail/add-stop-button";
import ContainerMap from "@/components/container-detail/container-map";
import { useDriverLatestPing } from "@/hooks/queries/use-driver-latest-ping";
import { useContainerFullData } from "@/hooks/queries/use-container-full-data";

export default function ContainerDetailPage() {
  const params = useParams();
  const idStr = params.id;

  if (!idStr) return <Navigate to="/app/operations/dispatch" replace />;
  const containerId = Number(idStr);

  const { data, isPending, error } = useContainerFullData(containerId);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;
  if (!data) return <Fallback />;

  // 활성 leg (IN_TRANSIT) 의 driver 를 찾아 실시간 위치 표시
  const activeLeg = data.legs.find((l) => l.status === "IN_TRANSIT");
  const activeDriverId = activeLeg?.driverId ?? null;
  const activeDriverName = activeLeg?.driverName ?? null;
  const { data: ping } = useDriverLatestPing(activeDriverId);
  const driverPosition = ping
    ? {
        lat: Number(ping.latitude),
        lng: Number(ping.longitude),
        driverName: activeDriverName,
      }
    : null;

  return (
    <div className="flex flex-col gap-4 p-6">
      <ContainerHeader full={data} />

      <ContainerMap full={data} driverPosition={driverPosition} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Legs</h2>
          {data.legs.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              Leg 없음
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.legs.map((leg) => (
                <LegCard key={leg.id} leg={leg} containerId={containerId} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Stops
            </span>
            <AddStopButton containerId={containerId} />
          </div>
          <StopsSequenceSortable
            containerId={containerId}
            stops={data.stops}
          />
          <EventsPanel events={data.events} />
        </div>
      </div>
    </div>
  );
}
