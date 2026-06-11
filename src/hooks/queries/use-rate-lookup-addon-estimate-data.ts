import { useQuery } from "@tanstack/react-query";

import { fetchAddonDriverRates, fetchAddons } from "@/api/addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { AddonDriverRate, AddonEntity } from "@/types";

export type AddonEstimateRow = {
  addon: AddonEntity;
  override: AddonDriverRate | null;
};

// 기사 정산 대상 add-on + 해당 기사 override 를 한 번에 수집.
// add-on 카탈로그가 작아(수십 건) driver-rates 를 병렬 fetch 해도 부담 없음.
export function useRateLookupAddonEstimateData(driverId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.rateLookup.addonEstimate(driverId ?? 0),
    queryFn: async (): Promise<AddonEstimateRow[]> => {
      const addons = (await fetchAddons({ size: 100 })).items.filter(
        (a) => a.isPayableToDriver && a.isActive
      );
      const rates = await Promise.all(
        addons.map((a) => fetchAddonDriverRates(a.id))
      );
      return addons.map((addon, i) => ({
        addon,
        override: rates[i].find((r) => r.driverId === driverId!) ?? null,
      }));
    },
    enabled: driverId != null,
  });
}
