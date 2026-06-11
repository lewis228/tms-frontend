import { useQuery } from "@tanstack/react-query";

import { fetchAddonDriverRates } from "@/api/addon";
import { QUERY_KEYS } from "@/lib/constants";

export function useAddonDriverRatesData(addonId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.addon.driverRates(addonId),
    queryFn: () => fetchAddonDriverRates(addonId),
  });
}
