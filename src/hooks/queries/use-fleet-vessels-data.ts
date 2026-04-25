import { fetchFleetVessels } from "@/api/fleet";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

// Team-scoped fleet snapshot. REST loads the initial list; the app's
// existing WebSocket connection (connected in src/lib/websocket.ts when
// available) is expected to dispatch `vessel.position_updated` events and
// patch `position` on each vessel via `queryClient.setQueryData`.
//
// `staleTime: Infinity` keeps TanStack Query from auto-refetching; the
// WebSocket is our invalidation channel. If the socket goes down we still
// get a stale-but-readable snapshot until the next manual invalidate
// (e.g. page remount) picks up fresh REST data.
export function useFleetVesselsData() {
  return useQuery({
    queryKey: QUERY_KEYS.fleet.list,
    queryFn: fetchFleetVessels,
    staleTime: Infinity,
  });
}
