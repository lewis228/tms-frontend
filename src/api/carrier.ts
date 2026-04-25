import api from "@/lib/axios";
import type { CarrierEntity } from "@/types";

// Backend query parameters — mirror `ListCarriersQuerySchema`.
export type ListCarriersParams = {
  supported_only?: boolean;
  scrapable_only?: boolean;
  search?: string;
};

export async function fetchCarriers(
  params: ListCarriersParams = {},
): Promise<CarrierEntity[]> {
  const { data } = await api.get<CarrierEntity[]>("/carriers", { params });
  return data;
}
