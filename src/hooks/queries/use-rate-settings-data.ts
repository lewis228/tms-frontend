import { useQuery } from "@tanstack/react-query";

import { fetchRateSettings } from "@/api/rate-setting";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useRateSettingsData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.rateSetting.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchRateSettings({ page, size: PAGE_SIZE }),
  });
}
