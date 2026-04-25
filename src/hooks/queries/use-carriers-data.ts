import { fetchCarriers, type ListCarriersParams } from "@/api/carrier";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

/**
 * Load the ocean carrier master catalogue.
 *
 * The catalogue is global (not team-scoped) and changes rarely, so we use a
 * long `staleTime` — re-fetching every navigation would be wasteful.
 * Supported filter params are passed through to the backend and become
 * part of the cache key, so callers can request narrowed subsets (e.g.
 * `scrapable_only: true`) without polluting the full-catalogue cache.
 */
export function useCarriersData(params: ListCarriersParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.carrier.list(params as Record<string, unknown>),
    queryFn: () => fetchCarriers(params),
    // Carrier records are essentially static for a user session — stale time
    // of 10 minutes avoids repeated round-trips on every route change while
    // still picking up admin edits on the next bounce.
    staleTime: 10 * 60 * 1000,
  });
}
