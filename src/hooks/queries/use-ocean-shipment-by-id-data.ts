import { fetchOceanShipmentById } from "@/api/ocean-shipment";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useOceanShipmentByIdData(shipmentId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.oceanShipment.byId(shipmentId ?? 0),
    queryFn: () => fetchOceanShipmentById(shipmentId!),
    enabled: !!shipmentId,
  });
}
