import { fetchDashboardData } from "@/api/dashboard";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useDashboardData() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.all,
    queryFn: fetchDashboardData,
  });
}
