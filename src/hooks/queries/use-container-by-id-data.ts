import { useQuery } from "@tanstack/react-query";

import { fetchContainer } from "@/api/container";
import { QUERY_KEYS } from "@/lib/constants";

export function useContainerByIdData(id: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.container.byId(id ?? -1),
    queryFn: () => fetchContainer(id!),
    enabled: !!id,
  });
}
