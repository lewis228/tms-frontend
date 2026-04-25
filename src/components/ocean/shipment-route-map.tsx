import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L, { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Minimize2 } from "lucide-react";
import type { LocationEntity, OceanShipmentStatus } from "@/types";
import { formatTimeAgo } from "@/lib/time";
import { computeSeaRoute } from "@/lib/sea-route";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ShipmentRouteMap — Leaflet-based POL → POD visualization.
//
// Design notes:
// - Tile source reuses the same CARTO Positron basemap as live-map so the
//   two screens feel coherent; see `components/live-map/live-map.tsx` for
//   attribution and tier caveats.
// - The route is drawn as a cubic bezier approximated with N sample points
//   through a control point offset perpendicular to the POL→POD line. This
//   gives the classic Terminal49 arc look without needing a great-circle
//   library. Solid green for "past" segment, dashed grey for "future".
// - Entry animation: the map mounts zoomed out on the world, then a post-
//   mount effect animates `fitBounds` to the route bounds for a cinematic
//   feel. If only POL has coordinates the map pans to POL without fitBounds.
// - Markers use L.divIcon so we can apply CSS keyframe "bobbing" animations
//   (gentle y-axis float) without bundling PNG sprites.
// - Popup on hover + click shows port name, country, and a timestamp that
//   reflects the shipment's timeline (departed / ETA).
// ---------------------------------------------------------------------------

type Props = {
  pol: LocationEntity | null;
  pod: LocationEntity | null;
  status: OceanShipmentStatus;
  etd: string | null;
  eta: string | null;
  updatedAt: string | null;
};

// Derive a progress fraction [0..1] along the POL→POD arc based on ETD/ETA
// and the current time. The path is split at this point into a "past"
// (solid green) segment and a "future" (dashed grey) segment, and a vessel
// icon is placed exactly at the progress point.
//
// Returns null when the shipment is still pending (no ETD) or when it's
// terminal (status delivered/stopped/arrived → progress is either 1 or
// "journey not active", handled separately).
function computeProgress(
  status: OceanShipmentStatus,
  etd: string | null,
  eta: string | null,
): number | null {
  // Final states: full route shown as completed.
  if (status === "stopped" || status === "cancelled") return 1;

  // Can't infer progress without both endpoints.
  if (!etd || !eta) return null;
  const departed = new Date(etd).getTime();
  const arrives = new Date(eta).getTime();
  if (Number.isNaN(departed) || Number.isNaN(arrives)) return null;
  if (arrives <= departed) return null;

  const now = Date.now();
  if (now <= departed) return 0;
  if (now >= arrives) return 1;
  return (now - departed) / (arrives - departed);
}

// Returns the heading (0-360°, 0 = north, clockwise) at a specific index
// in the arc path. Used to rotate the vessel icon so it points along the
// route direction.
function headingAt(
  path: [number, number][],
  index: number,
): number {
  const i = Math.max(0, Math.min(index, path.length - 2));
  const [lat1, lng1] = path[i];
  const [lat2, lng2] = path[i + 1];
  const dLng = lng2 - lng1;
  const y = Math.sin((dLng * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos((dLng * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Build a divIcon for the vessel marker — a ship silhouette that rotates
// along the bearing derived from the arc path. Adds its own gentle sway
// animation so motion is visible even when progress is static.
function buildVesselIcon(heading: number) {
  const html = `
    <div class="srm-vessel" style="transform: rotate(${heading}deg);">
      <div class="srm-vessel-halo"></div>
      <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2 L18 20 L12 16.5 L6 20 Z"
          fill="#0ea5e9"
          stroke="white"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "srm-vessel-icon",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

// Build the divIcon for a port anchor with floating bob animation. Passing
// `variant="pol"` for origin (emerald), `variant="pod"` for destination
// (slate). SVG is inline so CSS can drive the float.
function buildAnchorIcon(variant: "pol" | "pod") {
  const fill = variant === "pol" ? "#10b981" : "#475569";
  const labelBg = variant === "pol" ? "#059669" : "#334155";
  const label = variant === "pol" ? "POL" : "POD";
  const html = `
    <div class="srm-anchor srm-anchor-${variant}">
      <div class="srm-anchor-pin">
        <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
          <circle cx="17" cy="17" r="16" fill="white" stroke="${fill}" stroke-width="2"/>
          <g fill="${fill}">
            <path d="M17 7.5 a2 2 0 0 1 0 4 a2 2 0 0 1 0 -4 z"/>
            <path d="M16.2 12 h1.6 v8.2 h-1.6 z"/>
            <path d="M13.5 14 h7 v1.5 h-7 z"/>
            <path d="M11 19 c0 3 2.5 5 6 5 s6 -2 6 -5 l-1.5 0 c0 2 -2 3.5 -4.5 3.5 s-4.5 -1.5 -4.5 -3.5 z"/>
          </g>
        </svg>
      </div>
      <div class="srm-anchor-label" style="background:${labelBg}">${label}</div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "srm-anchor-icon",
    iconSize: [70, 48],
    iconAnchor: [17, 40],
    popupAnchor: [18, -30],
  });
}

// Sample a quadratic bezier curve between `a` and `b` using `c` as the
// control point, producing `steps + 1` LatLng points. Used for a soft
// arc that stays inside the viewport even on long trans-oceanic routes.
function bezierPoints(
  a: [number, number],
  b: [number, number],
  c: [number, number],
  steps = 64,
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const lat = mt * mt * a[0] + 2 * mt * t * c[0] + t * t * b[0];
    const lng = mt * mt * a[1] + 2 * mt * t * c[1] + t * t * b[1];
    out.push([lat, lng]);
  }
  return out;
}

// Perpendicular offset for the bezier control point. Offset direction
// flips based on which hemisphere the midpoint sits in so arcs always
// bow northward for trans-pacific routes (visually consistent with
// standard maritime charts).
function arcControlPoint(
  a: [number, number],
  b: [number, number],
): [number, number] {
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const dx = b[1] - a[1];
  const dy = b[0] - a[0];
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Curvature amplitude — scales with distance so short legs stay flat
  // and long trans-oceanic legs get a pronounced arc.
  const amplitude = Math.min(distance * 0.18, 22);
  // Perpendicular unit vector, biased northward.
  const nx = -dy / (distance || 1);
  const ny = dx / (distance || 1);
  const signedAmp = ny >= 0 ? amplitude : -amplitude;
  return [mid[0] + nx * signedAmp, mid[1] + ny * signedAmp];
}

// Great-circle distance between two `[lat, lng]` points in kilometres.
// Used to split the route path by real arc length instead of by vertex
// count — important because the maritime network returns unevenly
// spaced vertices (dense near waypoints, sparse on open-ocean legs).
function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Split a polyline at a fractional progress `[0..1]` by accumulated arc
// length. Returns the past/future segments plus the interpolated vessel
// point and the bearing at that point. Length-based so the ship reads
// "halfway there" at 0.5 on any path shape.
function splitPathByProgress(
  path: [number, number][],
  progress: number,
): {
  past: [number, number][];
  future: [number, number][];
  point: [number, number];
  heading: number;
} {
  if (path.length < 2) {
    const p = path[0] ?? [0, 0];
    return { past: [p], future: [p], point: p, heading: 0 };
  }
  const clamped = Math.max(0, Math.min(1, progress));
  const cum: number[] = [0];
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1] + haversineKm(path[i - 1], path[i]));
  }
  const total = cum[cum.length - 1];
  if (total === 0) {
    return {
      past: [path[0]],
      future: [path[path.length - 1]],
      point: path[0],
      heading: 0,
    };
  }
  const target = total * clamped;
  let seg = 1;
  while (seg < cum.length - 1 && cum[seg] < target) seg++;
  const prev = seg - 1;
  const segLen = cum[seg] - cum[prev];
  const frac = segLen === 0 ? 0 : (target - cum[prev]) / segLen;
  const point: [number, number] = [
    path[prev][0] + (path[seg][0] - path[prev][0]) * frac,
    path[prev][1] + (path[seg][1] - path[prev][1]) * frac,
  ];
  const past = [...path.slice(0, seg), point];
  const future = [point, ...path.slice(seg)];
  const heading = headingAt(path, prev);
  return { past, future, point, heading };
}

// Post-mount animation — flies from the current view to the route's
// bounds. Re-fires whenever `bounds` changes reference, which happens
// on first paint (bezier fallback) and again when the async sea-route
// resolves (real path swaps in). Leaflet's flyToBounds gracefully
// interrupts any in-flight animation if a second one arrives on top,
// so the sequence plays as a single continuous reveal.
function RouteBoundsAnimator({
  bounds,
  enabled,
}: {
  bounds: LatLngBoundsExpression | null;
  enabled: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !bounds) return;
    const id = window.setTimeout(() => {
      map.flyToBounds(bounds, {
        padding: [48, 48],
        duration: 1.4,
        easeLinearity: 0.15,
      });
    }, 180);
    return () => window.clearTimeout(id);
  }, [bounds, enabled, map]);
  return null;
}

// Invalidate map size when the container box changes (e.g. fullscreen
// toggle) so Leaflet re-measures and tiles repaint correctly.
function MapSizeInvalidator({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 200);
    return () => window.clearTimeout(id);
  }, [map, trigger]);
  return null;
}

export default function ShipmentRouteMap({
  pol,
  pod,
  status,
  etd,
  eta,
  updatedAt,
}: Props) {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState(false);

  // Stable coord tuples so downstream useMemo hooks don't see a new
  // reference every render.
  const polCoords = useMemo<[number, number] | null>(
    () =>
      pol && pol.latitude !== null && pol.longitude !== null
        ? [pol.latitude, pol.longitude]
        : null,
    [pol],
  );
  const podCoords = useMemo<[number, number] | null>(
    () =>
      pod && pod.latitude !== null && pod.longitude !== null
        ? [pod.latitude, pod.longitude]
        : null,
    [pod],
  );

  // Synchronous bezier fallback — ensures the map has a polyline from
  // first paint, even before the async sea-route module resolves or when
  // searoute can't snap the endpoints to its maritime network.
  const bezierPath = useMemo<[number, number][] | null>(() => {
    if (!polCoords || !podCoords) return null;
    const control = arcControlPoint(polCoords, podCoords);
    return bezierPoints(polCoords, podCoords, control, 80);
  }, [polCoords, podCoords]);

  // Real maritime route via `searoute-ts` — dynamically imported, so the
  // ~1.7 MB marine network chunk is only fetched on demand. Swaps in
  // over the bezier fallback once resolved; if the library returns null
  // (inland coord, no path) we stick with bezier.
  //
  // The result is tagged with a `key` derived from the endpoint coords so
  // stale responses are ignored when the shipment changes — avoids an
  // explicit `setRealRoute(null)` reset inside the effect body (which
  // would trigger a cascading render).
  const coordsKey = useMemo(() => {
    if (!polCoords || !podCoords) return null;
    return `${polCoords[0]},${polCoords[1]}|${podCoords[0]},${podCoords[1]}`;
  }, [polCoords, podCoords]);

  const [realRoute, setRealRoute] = useState<{
    key: string;
    path: [number, number][];
  } | null>(null);

  useEffect(() => {
    if (!polCoords || !podCoords || !coordsKey) return;
    let cancelled = false;
    computeSeaRoute(polCoords, podCoords).then((pts) => {
      if (cancelled) return;
      if (pts && pts.length > 1) setRealRoute({ key: coordsKey, path: pts });
    });
    return () => {
      cancelled = true;
    };
  }, [polCoords, podCoords, coordsKey]);

  const realPath =
    realRoute && realRoute.key === coordsKey ? realRoute.path : null;
  const arcPath = realPath ?? bezierPath;

  const bounds: LatLngBoundsExpression | null = useMemo(() => {
    if (arcPath) {
      return arcPath.map(
        (p) => [p[0], p[1]] as [number, number],
      );
    }
    if (polCoords) return [polCoords, polCoords];
    return null;
  }, [arcPath, polCoords]);

  // Progress along the arc (0..1) — splits the polyline into completed
  // (solid green) and pending (dashed grey) segments, and positions the
  // vessel marker. Null means "don't split, draw full arc as dashed".
  const progress = useMemo(
    () => computeProgress(status, etd, eta),
    [status, etd, eta],
  );

  const { pastSegment, futureSegment, vesselPoint, vesselHeading } =
    useMemo(() => {
      if (!arcPath) {
        return {
          pastSegment: null,
          futureSegment: null,
          vesselPoint: null,
          vesselHeading: 0,
        };
      }
      // Effective progress keeps the vessel on the arc even when ETD/ETA
      // are missing — parks at POL for "not yet departed" states.
      const effectiveProgress = progress ?? 0;
      const { past, future, point, heading } = splitPathByProgress(
        arcPath,
        effectiveProgress,
      );
      return {
        pastSegment: past.length > 1 ? past : null,
        futureSegment: future.length > 1 ? future : null,
        vesselPoint: point,
        vesselHeading: heading,
      };
    }, [arcPath, progress]);

  // Empty state — route data insufficient to plot anything.
  if (!polCoords && !podCoords) {
    return (
      <section className="flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white p-6 text-center">
        <span className="text-sm font-medium text-black/70">
          {t("pages.ocean.detail.map.emptyTitle")}
        </span>
        <span className="text-xs text-black/50">
          {t("pages.ocean.detail.map.emptyDescription")}
        </span>
      </section>
    );
  }

  return (
    <section
      className={cn(
        // `isolate` contains Leaflet's internal z-index scale (panes up to
        // 700, controls up to 1000) in its own stacking context. Without it
        // those values escape and paint over modal overlays portalled to
        // body level (Profile modal, Organize modal, etc.).
        "relative isolate overflow-hidden rounded-2xl border border-black/10 bg-white transition-all",
        fullscreen
          ? "fixed inset-4 z-[1000] shadow-2xl"
          : "min-h-[360px]",
      )}
    >
      {/* Shared keyframes for the anchor pins — injected once per mount.
          Scoped via the `.srm-*` class prefix so it can't leak into other
          leaflet instances on the same page. */}
      <style>{`
        @keyframes srm-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .srm-anchor-icon { background: transparent; border: 0; }
        .srm-anchor {
          position: relative;
          width: 70px;
          height: 48px;
          pointer-events: none;
        }
        .srm-anchor-pin {
          position: absolute;
          top: 0;
          left: 2px;
          width: 34px;
          height: 34px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.18));
          animation: srm-bob 3.2s ease-in-out infinite;
          pointer-events: auto;
          cursor: pointer;
        }
        .srm-anchor-pod .srm-anchor-pin { animation-delay: 1.6s; }
        .srm-anchor-label {
          position: absolute;
          top: 4px;
          left: 38px;
          color: white;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          pointer-events: auto;
        }
        .srm-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        }
        .srm-popup .leaflet-popup-content {
          margin: 10px 12px;
          font-size: 12px;
        }
        /* Vessel marker — triangle rotated by heading. Subtle pulse halo
           signals the ship is live/being tracked. */
        @keyframes srm-pulse {
          0% { transform: scale(0.7); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .srm-vessel-icon { background: transparent; border: 0; }
        .srm-vessel {
          position: relative;
          width: 26px;
          height: 26px;
          filter: drop-shadow(0 3px 5px rgba(14, 165, 233, 0.35));
        }
        .srm-vessel-halo {
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(14,165,233,0.35) 0%, rgba(14,165,233,0) 70%);
          animation: srm-pulse 2s ease-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Top-right toolbar — fullscreen toggle. Sits above the map via
          z-index and absolute positioning. */}
      <button
        type="button"
        onClick={() => setFullscreen((v) => !v)}
        className="absolute right-4 top-4 z-[500] flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black/60 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-black"
        aria-label={t(
          fullscreen
            ? "pages.ocean.detail.map.exitFullscreen"
            : "pages.ocean.detail.map.enterFullscreen",
        )}
      >
        {fullscreen ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
      </button>

      <MapContainer
        // Start zoomed out on the world — `RouteBoundsAnimator` then flies
        // to the actual route bounds on mount, giving the "zoom in reveal"
        // cinematic. `minZoom=1` keeps the floor looser than before (was 2,
        // felt restrictive) while still preventing the zoom-0 tiling
        // artifacts that show the Earth as a postage stamp.
        //
        // Smooth zoom tuning:
        //   - `zoomSnap=0` lets the final zoom value be any fraction
        //     (Leaflet otherwise snaps to whole integers).
        //   - `zoomDelta=0.25` means +/− buttons + double-click step by a
        //     quarter level instead of a full one.
        //   - `wheelPxPerZoomLevel=80` balances responsiveness vs. smoothness
        //     — lower = each wheel tick zooms more (less scroll needed).
        //     Default is 60; raise toward 100+ for gentler, more gradual
        //     zoom, lower toward 40 for snappier zoom.
        //   - `zoomAnimation` stays on so each step tweens smoothly.
        center={[20, 10]}
        zoom={2}
        minZoom={1}
        zoomSnap={0}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={20} // 마우스 휠 속도 조절
        zoomAnimation
        zoomControl={false}
        worldCopyJump
        // Scroll-wheel zoom ON — matches the Live Map behaviour and is the
        // convention users expect inside any Leaflet map.
        scrollWheelZoom
        style={{
          width: "100%",
          height: fullscreen ? "100%" : 420,
        }}
        className="[&_.leaflet-control-attribution]:!text-[10px]"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />
        <ZoomControl position="bottomright" />
        <RouteBoundsAnimator bounds={bounds} enabled={arcPath !== null} />
        <MapSizeInvalidator trigger={fullscreen} />

        {arcPath && (
          <>
            {/* Shadow underlay for depth — drawn below both segments. */}
            <Polyline
              positions={arcPath}
              pathOptions={{
                color: "#0f172a",
                weight: 6,
                opacity: 0.08,
                lineCap: "round",
              }}
            />
            {/* Completed portion (POL → vessel) — solid emerald. */}
            {pastSegment && (
              <Polyline
                positions={pastSegment}
                pathOptions={{
                  color: "#059669",
                  weight: 3.5,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            )}
            {/* Remaining portion (vessel → POD) — dashed slate. */}
            {futureSegment && (
              <Polyline
                positions={futureSegment}
                pathOptions={{
                  color: "#94a3b8",
                  weight: 3,
                  opacity: 0.75,
                  dashArray: "6 8",
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            )}
          </>
        )}

        {polCoords && pol && (
          <Marker position={polCoords} icon={buildAnchorIcon("pol")}>
            <Popup className="srm-popup" autoPan={false}>
              <PortPopup
                port={pol}
                kind="pol"
                timestamp={etd}
                updatedAt={updatedAt}
              />
            </Popup>
          </Marker>
        )}

        {podCoords && pod && (
          <Marker position={podCoords} icon={buildAnchorIcon("pod")}>
            <Popup className="srm-popup" autoPan={false}>
              <PortPopup
                port={pod}
                kind="pod"
                timestamp={eta}
                updatedAt={updatedAt}
              />
            </Popup>
          </Marker>
        )}

        {/* Vessel position — estimated from ETD/ETA progress. Always
            rendered so the user can locate the ship at a glance; at the
            endpoints it stacks with the POL or POD anchor (with a higher
            zIndex). `zIndexOffset` keeps the ship above the port anchors
            so at stacked positions the user can still click the ship. */}
        {vesselPoint && (
          <Marker
            position={vesselPoint}
            icon={buildVesselIcon(vesselHeading)}
            zIndexOffset={500}
          >
            <Popup className="srm-popup" autoPan={false}>
              <VesselPopup
                progress={progress}
                etd={etd}
                eta={eta}
                updatedAt={updatedAt}
              />
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </section>
  );
}

function PortPopup({
  port,
  kind,
  timestamp,
  updatedAt,
}: {
  port: LocationEntity;
  kind: "pol" | "pod";
  timestamp: string | null;
  updatedAt: string | null;
}) {
  const { t } = useTranslation();
  const title = `${port.name}, ${port.country_code}`;
  const timeLabel =
    kind === "pol"
      ? t("pages.ocean.detail.map.departed")
      : t("pages.ocean.detail.map.eta");
  return (
    <div className="flex min-w-[180px] flex-col gap-1">
      <span className="text-[13px] font-semibold text-black">{title}</span>
      {timestamp && (
        <span className="text-[11px] text-black/70">
          {timeLabel}: {formatTimestamp(timestamp)}
        </span>
      )}
      {updatedAt && (
        <span className="text-[11px] text-black/50">
          {t("pages.ocean.detail.map.lastUpdate")}: {formatTimeAgo(updatedAt)}
        </span>
      )}
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function VesselPopup({
  progress,
  etd,
  eta,
  updatedAt,
}: {
  // Nullable — when ETD/ETA are missing the vessel lives at POL and the
  // popup shows a "pending departure" status in place of a %.
  progress: number | null;
  etd: string | null;
  eta: string | null;
  updatedAt: string | null;
}) {
  const { t } = useTranslation();
  const pct = progress === null ? 0 : Math.round(progress * 100);
  const stateLabel =
    progress === null
      ? t("pages.ocean.detail.map.progressPending")
      : pct <= 0
        ? t("pages.ocean.detail.map.progressAtOrigin")
        : pct >= 100
          ? t("pages.ocean.detail.map.progressArrived")
          : t("pages.ocean.detail.map.progress", { percent: pct });
  return (
    <div className="flex min-w-[200px] flex-col gap-1">
      <span className="text-[13px] font-semibold text-black">
        {t("pages.ocean.detail.map.vesselTitle")}
      </span>
      <div className="my-1 h-1.5 w-full rounded-full bg-black/[0.08]">
        <div
          className="h-1.5 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-black/70">{stateLabel}</span>
      {etd && (
        <span className="text-[11px] text-black/55">
          {t("pages.ocean.detail.map.departed")}: {formatTimestamp(etd)}
        </span>
      )}
      {eta && (
        <span className="text-[11px] text-black/55">
          {t("pages.ocean.detail.map.eta")}: {formatTimestamp(eta)}
        </span>
      )}
      {updatedAt && (
        <span className="text-[11px] text-black/45">
          {t("pages.ocean.detail.map.lastUpdate")}: {formatTimeAgo(updatedAt)}
        </span>
      )}
    </div>
  );
}
