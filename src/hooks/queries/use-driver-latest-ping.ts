// driver 의 가장 최근 location_ping. 30초 polling 으로 실시간 효과.
import { useQuery } from "@tanstack/react-query";

import { fetchLatestPing } from "@/api/location-ping";
import { QUERY_KEYS } from "@/lib/constants";

export function useDriverLatestPing(driverId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.locationPing.latest(driverId ?? 0),
    queryFn: () => fetchLatestPing(driverId!),
    enabled: !!driverId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });
}
