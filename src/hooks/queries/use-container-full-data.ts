// v3 컨테이너 상세 (헤더 + stops + legs + segments + rate + charges + events 한방)
import { useQuery } from "@tanstack/react-query";

import { fetchContainerFull } from "@/api/container-v3";
import { QUERY_KEYS } from "@/lib/constants";

export function useContainerFullData(containerId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.containerV3.full(containerId ?? 0),
    queryFn: () => fetchContainerFull(containerId!),
    enabled: !!containerId,
  });
}
