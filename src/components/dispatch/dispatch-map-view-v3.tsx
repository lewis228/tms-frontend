// v3 Dispatch Map — 진행 중 컨테이너 한 화면.
// 활성 컨테이너의 현재 위치(=활성 leg from_stop / driver position) 핀.
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useContainersV3Data } from "@/hooks/queries/use-containers-v3-data";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import type { ContainerListEntity, ContainerWorkState } from "@/types";

const STATE_COLOR: Record<ContainerWorkState, string> = {
  DRAFT: "#a1a1aa",
  PLANNED: "#3b82f6",
  IN_TRANSIT: "#f59e0b",
  AT_STOP: "#06b6d4",
  WAITING_PLAN: "#ef4444",
  HOLD: "#f97316",
  COMPLETED: "#10b981",
  CANCELLED: "#71717a",
};

function containerIcon(state: ContainerWorkState) {
  const color = STATE_COLOR[state] ?? "#a1a1aa";
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ bounds }: { bounds: LatLngExpression[] }) {
  const map = useMap();
  if (bounds.length === 1) {
    map.setView(bounds[0], 11);
  } else if (bounds.length > 1) {
    map.fitBounds(L.latLngBounds(bounds as L.LatLngTuple[]), {
      padding: [40, 40],
    });
  }
  return null;
}

export default function DispatchMapViewV3() {
  const { teamId } = useParams();
  const { data, isPending, error } = useContainersV3Data({ size: 200 });
  const { data: locationsData } = useLocationsData(1);

  const locById = useMemo(() => {
    const m = new Map<number, { lat: number; lng: number; name: string }>();
    for (const l of locationsData?.items ?? []) {
      if (l.latitude !== null && l.longitude !== null) {
        m.set(l.id, {
          lat: Number(l.latitude),
          lng: Number(l.longitude),
          name: l.name,
        });
      }
    }
    return m;
  }, [locationsData]);

  const pinned = useMemo(() => {
    const items = data?.items ?? [];
    return items
      .filter(
        (c) =>
          c.workState !== "COMPLETED" &&
          c.workState !== "CANCELLED" &&
          c.workState !== "DRAFT",
      )
      .map((c) => {
        const stopId = c.nextStopId;
        if (!stopId) return null;
        // 컨테이너 list 응답에는 stop 좌표가 없음. delivery_location_id 가 있으면 그걸로 fallback.
        const loc = c.deliveryLocationId
          ? locById.get(c.deliveryLocationId)
          : null;
        if (!loc) return null;
        return { c, lat: loc.lat, lng: loc.lng, locName: loc.name };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [data, locById]);

  const bounds: LatLngExpression[] = useMemo(
    () => pinned.map((p) => [p.lat, p.lng] as LatLngExpression),
    [pinned],
  );

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  if (pinned.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        진행 중 컨테이너가 없거나 location 좌표 미등록.
      </div>
    );
  }

  const center: LatLngExpression =
    bounds.length > 0 ? bounds[0] : [37.5665, 126.978];

  return (
    <div className="overflow-hidden rounded-md border">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: 500, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        {pinned.map((p) => (
          <Marker
            key={p.c.id}
            position={[p.lat, p.lng]}
            icon={containerIcon(
              (p.c.workState ?? "DRAFT") as ContainerWorkState,
            )}
          >
            <Popup>
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-mono font-semibold">
                  {p.c.containerNumber ?? "—"}
                </span>
                <span className="text-muted-foreground">
                  {p.c.workState} · {p.c.currentDriverName ?? "no driver"}
                </span>
                <span className="text-muted-foreground">
                  Next: {p.locName}
                </span>
                <Link
                  to={`/app/${teamId}/containers/${p.c.id}`}
                  className="text-blue-700 hover:underline"
                >
                  상세 →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-3 border-t px-3 py-2 text-[11px] text-muted-foreground">
        {(
          [
            "PLANNED",
            "IN_TRANSIT",
            "AT_STOP",
            "WAITING_PLAN",
            "HOLD",
          ] as ContainerWorkState[]
        ).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: STATE_COLOR[s] }}
            />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
