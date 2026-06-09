import { useQuery } from "@tanstack/react-query";

import { fetchExpiringCompliance } from "@/api/analytics";
import { QUERY_KEYS } from "@/lib/constants";

export function useExpiringComplianceData(days = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.expiringCompliance(days),
    queryFn: () => fetchExpiringCompliance(days),
  });
}
