import { useQuery } from "@tanstack/react-query";
import {
  fetchOceanContainers,
  type OceanContainerListParams,
} from "@/api/ocean-container";
import { QUERY_KEYS } from "@/lib/constants";

export function useOceanContainersData(params: OceanContainerListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.oceanContainer.list(params),
    queryFn: () => fetchOceanContainers(params),
  });
}
