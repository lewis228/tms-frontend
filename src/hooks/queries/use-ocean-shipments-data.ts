import {
  fetchOceanShipments,
  type OceanShipmentListParams,
} from "@/api/ocean-shipment";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useOceanShipmentsData(params: OceanShipmentListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.oceanShipment.list(
      params as unknown as Record<string, unknown>,
    ),
    queryFn: () => fetchOceanShipments(params),
  });
}
