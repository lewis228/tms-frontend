// Maritime routing wrapper around `searoute-ts`.
//
// `searoute-ts` bundles a ~1.7 MB global marine network GeoJSON at module
// load time. We dynamic-import it so the bundle only pays that cost on
// pages that actually plot a shipment route. `modulePromise` memoizes so
// multiple maps share a single download.

type LatLng = [number, number];

let modulePromise: Promise<typeof import("searoute-ts")> | null = null;

function loadModule() {
  if (!modulePromise) {
    modulePromise = import("searoute-ts");
  }
  return modulePromise;
}

// Compute an ocean route between two `[lat, lng]` coordinates. Returns
// `null` when the network cannot route between the two points — typical
// causes are inland coordinates too far from any lane, or identical
// endpoints. Callers should fall back to a straight line / bezier arc.
export async function computeSeaRoute(
  from: LatLng,
  to: LatLng,
): Promise<LatLng[] | null> {
  try {
    const mod = await loadModule();
    // searoute expects GeoJSON-order `[lng, lat]`.
    const origin = { type: "Point" as const, coordinates: [from[1], from[0]] };
    const dest = { type: "Point" as const, coordinates: [to[1], to[0]] };
    const feature = mod.seaRoute(origin, dest);
    if (!feature?.geometry) return null;
    const coords = feature.geometry.coordinates as [number, number][];
    if (!coords || coords.length < 2) return null;
    // Flip back to `[lat, lng]` for Leaflet.
    return coords.map(([lng, lat]) => [lat, lng] as LatLng);
  } catch {
    return null;
  }
}
