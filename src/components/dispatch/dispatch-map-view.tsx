// Dispatch Map — react-leaflet + OSM tile.
//
// 토글:
//  - "마스터": locations + terminals (lat/lng 있는 active 만)
//  - "D/O": 현재 진행 중 (status != COMPLETED) D/O 의 delivery/return location 마커
// 마커 클릭:
//  - 마스터: 이름 + 그 위치를 사용 중인 진행 D/O 개수
//  - D/O: 직접 drawer 열기 버튼
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useDeliveryOrdersData } from "@/hooks/queries/use-delivery-orders-data";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { useTerminalsData } from "@/hooks/queries/use-terminals-data";
import type { DeliveryOrderEntity, LocationEntity, TerminalEntity } from "@/types";

// react-leaflet v5 + Vite 에서 default 마커 아이콘이 깨지는 알려진 이슈 — 직접 지정.
// (CDN URL 대신 unpkg 의 기본 svg 사용)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const masterIcon = defaultIcon;

const doIcon = L.divIcon({
  className: "",
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#7c3aed;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

type Mode = "master" | "do";

export default function DispatchMapView() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("master");
  const { data: locationsData, isPending: locP, error: locE } = useLocationsData(1);
  const { data: terminalsData, isPending: tmP, error: tmE } = useTerminalsData(1);
  const { data: doData, isPending: doP, error: doE } = useDeliveryOrdersData(1);

  if (locE || tmE || doE) return <Fallback />;
  if (locP || tmP || doP) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-1 rounded-md border p-0.5 self-end">
        {(["master", "do"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={
              "rounded px-3 py-1 text-xs transition-colors " +
              (mode === m
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50")
            }
          >
            {m === "master" ? t("dispatch.map.modeMaster") : t("dispatch.map.modeDo")}
          </button>
        ))}
      </div>
      <div className="h-[calc(100vh-260px)] overflow-hidden rounded-md border">
        <MapContainer
          center={[34.05, -118.25]}
          zoom={10}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mode === "master" && (
            <MasterLayer
              locations={locationsData?.items ?? []}
              terminals={terminalsData?.items ?? []}
              deliveryOrders={doData?.items ?? []}
            />
          )}
          {mode === "do" && (
            <DOLayer
              locations={locationsData?.items ?? []}
              deliveryOrders={doData?.items ?? []}
            />
          )}
          <FitBounds
            mode={mode}
            locations={locationsData?.items ?? []}
            terminals={terminalsData?.items ?? []}
            deliveryOrders={doData?.items ?? []}
          />
        </MapContainer>
      </div>
    </div>
  );
}

function MasterLayer({
  locations,
  terminals,
  deliveryOrders,
}: {
  locations: LocationEntity[];
  terminals: TerminalEntity[];
  deliveryOrders: DeliveryOrderEntity[];
}) {
  const { t } = useTranslation();
  // H-1: D/O 헤더에서 location 제거. usage 집계는 leg/container 기반으로 H-6 에서 재설계.
  const usageByLocation = useMemo(() => new Map<number, number>(), []);
  const usageByTerminal = useMemo(() => {
    const m = new Map<number, number>();
    for (const d of deliveryOrders) {
      if (d.status === "COMPLETED") continue;
      if (d.terminalId) m.set(d.terminalId, (m.get(d.terminalId) ?? 0) + 1);
    }
    return m;
  }, [deliveryOrders]);

  return (
    <>
      {locations
        .filter((l) => l.isActive && l.latitude && l.longitude)
        .map((l) => (
          <Marker
            key={l.id}
            position={[Number(l.latitude), Number(l.longitude)]}
            icon={masterIcon}
          >
            <Popup>
              <div className="flex flex-col gap-1 text-xs">
                <strong>{l.name}</strong>
                <span className="text-muted-foreground">
                  {t("dispatch.map.locationLabel", { kind: l.kind })}
                </span>
                {l.address && <span>{l.address}</span>}
                <span className="text-muted-foreground">
                  {t("dispatch.map.activeDoCount", {
                    count: usageByLocation.get(l.id) ?? 0,
                  })}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      {terminals
        .filter((tm) => tm.isActive && tm.latitude && tm.longitude)
        .map((tm) => (
          <Marker
            key={tm.id}
            position={[Number(tm.latitude), Number(tm.longitude)]}
            icon={masterIcon}
          >
            <Popup>
              <div className="flex flex-col gap-1 text-xs">
                <strong>{tm.name}</strong>
                <span className="text-muted-foreground">
                  {t("dispatch.map.terminalLabel")}
                  {tm.code ? ` · ${tm.code}` : ""}
                </span>
                {tm.address && <span>{tm.address}</span>}
                <span className="text-muted-foreground">
                  {t("dispatch.map.activeDoCount", {
                    count: usageByTerminal.get(tm.id) ?? 0,
                  })}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
    </>
  );
}

function DOLayer({
  locations,
  deliveryOrders,
}: {
  locations: LocationEntity[];
  deliveryOrders: DeliveryOrderEntity[];
}) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const locById = useMemo(() => {
    const m = new Map<number, LocationEntity>();
    for (const l of locations) m.set(l.id, l);
    return m;
  }, [locations]);

  // H-1: D/O 헤더에서 location 분리. 마커는 H-6 (leg_stop) 정합성 후 재구성.
  const markers = useMemo(
    (): {
      id: number;
      name: string;
      lat: number;
      lng: number;
      status: string;
      container: string | null;
    }[] => [],
    [],
  );
  void deliveryOrders;
  void locById;

  const openDrawer = (id: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("do", String(id));
      return next;
    }, { replace: true });
  };

  return (
    <>
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={doIcon}>
          <Popup>
            <div className="flex flex-col gap-1 text-xs">
              <strong className="font-mono">
                {m.container ?? t("dispatch.containerUnnamed")}
              </strong>
              <span className="text-muted-foreground">
                {m.name} · {m.status}
              </span>
              <Button
                size="sm"
                onClick={() => openDrawer(m.id)}
                className="mt-1 h-6 text-[10px]"
              >
                {t("dispatch.map.openDrawer")}
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// 마커가 모이는 영역으로 자동 fit.
function FitBounds({
  mode,
  locations,
  terminals,
  deliveryOrders,
}: {
  mode: Mode;
  locations: LocationEntity[];
  terminals: TerminalEntity[];
  deliveryOrders: DeliveryOrderEntity[];
}) {
  const map = useMap();
  const points = useMemo(() => {
    const pts: [number, number][] = [];
    if (mode === "master") {
      for (const l of locations) {
        if (l.isActive && l.latitude && l.longitude)
          pts.push([Number(l.latitude), Number(l.longitude)]);
      }
      for (const t of terminals) {
        if (t.isActive && t.latitude && t.longitude)
          pts.push([Number(t.latitude), Number(t.longitude)]);
      }
    } else {
      // H-1: D/O 헤더에서 locations 제거. zoom-to-DOs 는 H-6 에서 leg/stop 기반으로 재구성.
      void deliveryOrders;
    }
    return pts;
  }, [mode, locations, terminals, deliveryOrders]);

  if (points.length > 0) {
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }
  return null;
}
