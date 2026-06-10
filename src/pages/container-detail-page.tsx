// /app/:teamId/containers/:id — Shipment(컨테이너) 상세 (Turvo 스타일 탭 레이아웃)
import { useTranslation } from "react-i18next";
import { Link, Navigate, useParams } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import DetailLayout, { type DetailTab } from "@/components/detail-layout";
import StopsSequenceSortable from "@/components/container-detail/stops-sequence-sortable";
import LegCard from "@/components/container-detail/leg-card";
import EventsPanel from "@/components/container-detail/events-panel";
import AddStopButton from "@/components/container-detail/add-stop-button";
import ApplyLoadTypeButton from "@/components/container-detail/apply-load-type-button";
import ContainerMap from "@/components/container-detail/container-map";
import { useDriverLatestPing } from "@/hooks/queries/use-driver-latest-ping";
import { useContainerFullData } from "@/hooks/queries/use-container-full-data";
import { formatDateTime } from "@/lib/format";
import type { ContainerWorkState } from "@/types";

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

export default function ContainerDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const teamId = params.teamId;
  const idStr = params.id;
  const containerId = idStr ? Number(idStr) : 0;

  // ⚠️ Hook 규칙: 모든 hook 은 early return 전에 호출. enabled 가 안전 가드.
  const { data, isPending, error } = useContainerFullData(
    containerId || undefined,
  );

  // 활성 leg (IN_TRANSIT) 의 driver 를 찾아 실시간 위치 표시.
  // data 가 아직 없을 때는 null → useDriverLatestPing 의 enabled 가 false 로 떨어짐.
  const activeLeg = data?.legs.find((l) => l.status === "IN_TRANSIT") ?? null;
  const activeDriverId = activeLeg?.driverId ?? null;
  const activeDriverName = activeLeg?.driverName ?? null;
  const { data: ping } = useDriverLatestPing(activeDriverId);

  if (!idStr) return <Navigate to="/app" replace />;
  if (error) return <Fallback />;
  if (isPending) return <Loader />;
  if (!data) return <Fallback />;

  const c = data.container;
  const d = data.deliveryOrder;
  const state = (c.workState ?? "DRAFT") as ContainerWorkState;
  const tone = STATE_TONE[state] ?? STATE_TONE.DRAFT;

  const driverPosition = ping
    ? {
        lat: Number(ping.latitude),
        lng: Number(ping.longitude),
        driverName: activeDriverName,
      }
    : null;

  const originStop = data.stops[0] ?? null;
  const destStop =
    data.stops.length > 0 ? data.stops[data.stops.length - 1] : null;

  const tabs: DetailTab[] = [
    {
      value: "legs",
      label: t("shipmentDetail.tabs.legs"),
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-semibold">
              {t("shipmentDetail.legsHeading")}
            </h2>
            <ApplyLoadTypeButton containerId={containerId} />
          </div>
          {data.legs.length === 0 ? (
            <div className="text-muted-foreground rounded-md border p-4 text-sm">
              {t("shipmentDetail.noLegs")}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.legs.map((leg) => (
                <LegCard key={leg.id} leg={leg} containerId={containerId} />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      value: "stops",
      label: t("shipmentDetail.tabs.stops"),
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium uppercase">
              {t("shipmentDetail.stopsHeading")}
            </span>
            <AddStopButton containerId={containerId} />
          </div>
          <StopsSequenceSortable containerId={containerId} stops={data.stops} />
        </div>
      ),
    },
    {
      value: "events",
      label: t("shipmentDetail.tabs.events"),
      content: <EventsPanel events={data.events} />,
    },
    {
      value: "map",
      label: t("shipmentDetail.tabs.map"),
      content: <ContainerMap full={data} driverPosition={driverPosition} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6">
      <DetailLayout
        title={<span className="font-mono">{c.containerNumber ?? "—"}</span>}
        badge={
          <span className={`rounded px-2 py-0.5 text-xs ${tone}`}>{state}</span>
        }
        meta={
          <>
            <span>
              {t("shipmentDetail.meta.route")}:{" "}
              {originStop?.locationName ?? "—"} → {destStop?.locationName ?? "—"}
            </span>
            <span>
              {t("shipmentDetail.meta.size")}: {c.size ?? "—"}
            </span>
            <span>
              {t("shipmentDetail.meta.deliveryOrder")}:{" "}
              {d.id ? (
                <Link
                  to={`/app/${teamId}/delivery-orders/${d.id}`}
                  className="text-blue-700 hover:underline"
                >
                  {d.blNumber ?? `#${d.id}`}
                </Link>
              ) : (
                "—"
              )}
            </span>
            <span>
              {t("shipmentDetail.meta.customer")}: {d.customerName ?? "—"}
            </span>
            <span>
              {t("shipmentDetail.meta.direction")}:{" "}
              <span className="font-mono">{d.direction ?? "—"}</span>
            </span>
            <span>
              {t("shipmentDetail.meta.terminal")}: {d.terminalName ?? "—"}
            </span>
            <span>
              {t("shipmentDetail.meta.vessel")}: {d.vesselName ?? "—"}
            </span>
            <span>
              {t("shipmentDetail.meta.driver")}: {activeDriverName ?? "—"}
            </span>
            <span>
              {t("shipmentDetail.meta.demurrageLfd")}:{" "}
              <span className="font-mono">{c.demurrageLfd ?? "—"}</span>
            </span>
            <span>
              {t("shipmentDetail.meta.eta")}:{" "}
              {d.eta ? formatDateTime(d.eta) : "—"}
            </span>
          </>
        }
        tabs={tabs}
      />
    </div>
  );
}
