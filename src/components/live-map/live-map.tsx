import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MOCK_VESSELS,
  STATUS_COLORS,
  type Vessel,
  type VesselStatus,
} from "@/components/live-map/mock-vessels";

// =============================================================================
// BACKEND AIS 연동 스위치 가이드
// =============================================================================
// 현재: MOCK_VESSELS 로 동작 (백엔드 `AIS_PROVIDER=mock` 이어도 동일).
//
// 실제 AIS 붙이려면 아래 3줄만 바꾸면 됨:
//
//   1. 데이터 소스 교체
//      import { useFleetVesselsData } from "@/hooks/queries/use-fleet-vessels-data";
//      const { data: fleet } = useFleetVesselsData();
//      const source = fleet ?? [];
//
//   2. 위 `source` 를 `MOCK_VESSELS` 자리에 주입. VesselEntity (api/fleet.ts)
//      와 현재 Vessel 타입을 약간 매핑:
//         lat     ← position?.latitude
//         lng     ← position?.longitude
//         heading ← position?.heading_degrees
//         status  ← position?.navigation_status || "unknown"
//         speedKnots ← position?.speed_knots
//      매핑 유틸을 useMemo 로 분리하면 깔끔.
//
//   3. WebSocket 리스너 등록 (App.tsx 또는 WebSocketProvider 에서):
//         import { shipmentWs } from "@/lib/websocket";
//         import { queryClient } from "@/main";   // queryClient 싱글턴 노출 필요
//         import { QUERY_KEYS } from "@/lib/constants";
//
//         shipmentWs.addListener((evt) => {
//           if (evt.type !== "vessel.position_updated") return;
//           const updates = evt.payload.vessels as VesselEntity[];
//           queryClient.setQueryData<VesselEntity[]>(
//             QUERY_KEYS.fleet.list,
//             (prev) =>
//               (prev ?? []).map((v) => {
//                 const next = updates.find((x) => x.id === v.id);
//                 return next ? { ...v, position: next.position } : v;
//               }),
//           );
//         });
//
// Leaflet Marker 의 `position` prop 이 변경 감지되면 자동 재렌더 → 마커 이동.
// =============================================================================

// Build a divIcon that renders a rotated SVG triangle for each vessel.
// The triangle points along the vessel's heading so users can read
// direction at a glance. Status drives fill colour. Kept as divIcon
// (not L.Icon) so we can style via CSS and inline SVG without bundling
// PNG sprites — matches the rest of the app's icon approach.
function buildVesselIcon(status: VesselStatus, heading: number) {
  const color = STATUS_COLORS[status];
  const html = `
    <div style="
      transform: rotate(${heading}deg);
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 1 L15 16 L9 13 L3 16 Z"
          fill="${color}"
          stroke="white"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "vessel-marker",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const STATUS_FILTERS: ReadonlyArray<{ id: "all" | VesselStatus; labelKey: string }> = [
  { id: "all", labelKey: "pages.liveMap.filter.all" },
  { id: "underway", labelKey: "pages.liveMap.filter.underway" },
  { id: "at-port", labelKey: "pages.liveMap.filter.atPort" },
  { id: "anchored", labelKey: "pages.liveMap.filter.anchored" },
  { id: "delayed", labelKey: "pages.liveMap.filter.delayed" },
];

export default function LiveMap() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | VesselStatus
  >("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    MOCK_VESSELS[0]?.id ?? null,
  );

  const vessels = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_VESSELS.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (q === "") return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.mbl.toLowerCase().includes(q) ||
        v.carrierName.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter]);

  const selected = MOCK_VESSELS.find((v) => v.id === selectedId) ?? null;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      {/* Map card */}
      <section className="relative overflow-hidden rounded-2xl border border-black/10 bg-white">
        <MapContainer
          center={[selected?.lat ?? 30, selected?.lng ?? -90]}
          zoom={3}
          zoomControl={false}
          style={{ height: "100%", width: "100%", minHeight: 420 }}
          className="rounded-2xl [&_.leaflet-control-attribution]:!text-[10px]"
        >
          {/*
            Tile source: CARTO Positron (회색톤 basemap).
            - 엔진: Leaflet (BSD-2, 완전 무료)
            - 지리 데이터: OpenStreetMap (ODbL, attribution 필수)
            - 타일 이미지: CARTO `basemaps.cartocdn.com` 공개 CDN
                · 현재는 API 키 없이도 응답함 — 관대하게 열려 있는 상태이지
                  공식 약관상 보장된 무료 사용은 아님 (회색지대).
                · 낮은 트래픽 / 개발 단계에선 문제 없음. 베타 오픈 전에
                  CARTO 무료 계정 발급 후 `?api_key=...` 를 URL 에 붙이거나
                  MapTiler / Stadia Maps 등으로 교체할 것.
                · 상업 트래픽 본격화 시점엔 유료 tier / 자체 타일 서버 검토.
          */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap &copy; CARTO"
          />
          <ZoomControl position="topright" />
          {vessels.map((vessel) => (
            <Marker
              key={vessel.id}
              position={[vessel.lat, vessel.lng]}
              icon={buildVesselIcon(vessel.status, vessel.heading)}
              eventHandlers={{
                click: () => setSelectedId(vessel.id),
              }}
            >
              <Popup>
                <VesselPopup vessel={vessel} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend pinned at top-left over the map */}
        <div className="absolute left-4 top-4 z-[500] flex flex-col gap-1 rounded-xl border border-black/10 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-black/55">
            {t("pages.liveMap.legend.title")}
          </span>
          {(
            ["underway", "at-port", "anchored", "delayed"] as VesselStatus[]
          ).map((s) => (
            <span key={s} className="flex items-center gap-2 text-xs text-black">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[s] }}
              />
              {t(`pages.liveMap.legend.${s}`)}
            </span>
          ))}
        </div>
      </section>

      {/* Side panel */}
      <aside className="flex min-h-0 flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-black">
            {t("pages.liveMap.panelTitle", { count: vessels.length })}
          </h3>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/45" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("pages.liveMap.searchPlaceholder")}
            className="h-8 w-full rounded-full bg-black/[0.04] pl-8 pr-3 text-xs text-black placeholder:text-black/45 focus:outline-none focus:ring-1 focus:ring-black/15"
            aria-label={t("pages.liveMap.searchPlaceholder")}
          />
        </div>

        {/* Status filter chips */}
        <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
          {STATUS_FILTERS.map((f) => {
            const active = f.id === statusFilter;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "shrink-0 rounded-full px-2 py-1 text-[10.5px] font-medium transition-colors",
                  active
                    ? "bg-black text-white"
                    : "bg-black/[0.04] text-black/70 hover:bg-black/[0.08] hover:text-black",
                )}
              >
                {t(f.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Vessel list — scrolls on overflow */}
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {vessels.map((v) => {
            const isSelected = v.id === selectedId;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-xl p-2 text-left transition-colors",
                    isSelected
                      ? "bg-black/[0.06]"
                      : "hover:bg-black/[0.04]",
                  )}
                >
                  <span
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: STATUS_COLORS[v.status] + "22",
                      color: STATUS_COLORS[v.status],
                    }}
                  >
                    <Ship className="h-3 w-3" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-semibold text-black">
                      {v.name}
                    </span>
                    <span className="truncate text-[11px] text-black/55">
                      {v.origin} → {v.destination}
                    </span>
                    <span className="truncate text-[11px] text-black/45">
                      {v.carrierName} · {v.speedKnots.toFixed(1)} kn
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
          {vessels.length === 0 && (
            <li className="py-6 text-center text-xs text-black/45">
              {t("pages.liveMap.empty")}
            </li>
          )}
        </ul>
      </aside>
    </div>
  );
}

function VesselPopup({ vessel }: { vessel: Vessel }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-[180px] flex-col gap-1 text-xs">
      <span className="text-sm font-semibold text-black">{vessel.name}</span>
      <span className="text-black/55">
        {vessel.carrierName} · {vessel.mbl}
      </span>
      <span className="text-black/55">
        {vessel.origin} → {vessel.destination}
      </span>
      <span className="text-black/55">
        {t("pages.liveMap.popup.speed", { speed: vessel.speedKnots.toFixed(1) })}
      </span>
      <span className="text-black/55">
        {t("pages.liveMap.popup.eta", { eta: vessel.etaLabel })}
      </span>
    </div>
  );
}
