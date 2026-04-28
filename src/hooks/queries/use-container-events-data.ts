import { useQuery } from "@tanstack/react-query";

import { fetchContainerEvents } from "@/api/container";
import { QUERY_KEYS } from "@/lib/constants";

export function useContainerEventsData(containerId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.container.events(containerId ?? -1),
    queryFn: () => fetchContainerEvents(containerId!),
    enabled: !!containerId,
  });
}
