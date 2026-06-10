// 컨테이너 상세 지도 — Stop 핀 + Leg 경로선 + 활성 driver 위치 핀.
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import { useLocationsData } from "@/hooks/queries/use-locations-data";
import type { ContainerFullEntity, StopRole } from "@/types";

const ROLE_COLOR: Record<StopRole, string> = {
  ORIGIN: "#3b82f6",
  DELIVERY: "#10b981",
  TRANSIT: "#a1a1aa",
  TERMINUS: "#1e293b",
};

function stopIcon(role: StopRole, sequenceNo: number) {
  const color = ROLE_COLOR[role];
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${color};color:white;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);font-size:11px;font-weight:600;font-family:monospace">${sequenceNo}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const driverIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#f59e0b;border:3px solid white;box-shadow:0 0 0 4px rgba(245,158,11,0.3)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ bounds }: { bounds: LatLngExpression[] }) {
  const map = useMap();
  if (bounds.length >= 1) {
    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    } else {
      map.fitBounds(L.latLngBounds(bounds as L.LatLngTuple[]), {
        padding: [40, 40],
      });
    }
  }
  return null;
}

export default function ContainerMap({
  full,
  driverPosition,
}: {
  full: ContainerFullEntity;
  driverPosition?: { lat: number; lng: number; driverName?: string | null } | null;
}) {
  const { t } = useTranslation();
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

  const stopsWithCoords = useMemo(() => {
    return full.stops
      .map((s) => {
        if (s.locationId === null) return null;
        const loc = locById.get(s.locationId);
        if (!loc) return null;
        return { ...s, lat: loc.lat, lng: loc.lng, locName: loc.name };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [full.stops, locById]);

  const bounds: LatLngExpression[] = useMemo(() => {
    const b: LatLngExpression[] = stopsWithCoords.map(
      (s) => [s.lat, s.lng] as LatLngExpression,
    );
    if (driverPosition) b.push([driverPosition.lat, driverPosition.lng]);
    return b;
  }, [stopsWithCoords, driverPosition]);

  // 경로선 — Container Stop 시퀀스를 순서대로 연결한 좌표
  const routePolylines = useMemo(() => {
    const ordered = [...stopsWithCoords].sort(
      (a, b) => a.sequenceNo - b.sequenceNo,
    );
    const segments: {
      id: number;
      from: [number, number];
      to: [number, number];
    }[] = [];
    for (let i = 0; i < ordered.length - 1; i++) {
      segments.push({
        id: ordered[i].id,
        from: [ordered[i].lat, ordered[i].lng],
        to: [ordered[i + 1].lat, ordered[i + 1].lng],
      });
    }
    return segments;
  }, [stopsWithCoords]);

  if (stopsWithCoords.length === 0 && !driverPosition) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        지도에 표시할 좌표가 없습니다 (Location 좌표 미등록).
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
        style={{ height: 360, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />

        {routePolylines.map((p) => (
          <Polyline
            key={p.id}
            positions={[p.from, p.to]}
            pathOptions={{
              color: "#a1a1aa",
              weight: 3,
              opacity: 0.7,
            }}
          />
        ))}

        {stopsWithCoords.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={stopIcon(s.role, s.sequenceNo)}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-mono">
                  #{s.sequenceNo} · {s.role}
                </div>
                <div className="font-medium">{s.locName}</div>
                {s.actualArrival && (
                  <div className="text-muted-foreground">
                    actual {s.actualArrival}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {driverPosition && (
          <Marker
            position={[driverPosition.lat, driverPosition.lng]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-medium">
                  {driverPosition.driverName ?? "Driver"}
                </div>
                <div className="text-muted-foreground">{t("container.map.currentLocation")}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
