// v3 컨테이너의 stop 시퀀스
import { useQuery } from "@tanstack/react-query";

import { fetchContainerStops } from "@/api/container-v3";
import { QUERY_KEYS } from "@/lib/constants";

export function useContainerStopsData(containerId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.containerV3.stops(containerId ?? 0),
    queryFn: () => fetchContainerStops(containerId!),
    enabled: !!containerId,
  });
}
