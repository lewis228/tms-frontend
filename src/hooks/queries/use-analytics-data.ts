import { useQuery } from "@tanstack/react-query";

import {
  fetchMarginTrend,
  fetchDriverUtilization,
  fetchContainerTurnover,
  fetchStreetTurnSavings,
} from "@/api/analytics";
import { QUERY_KEYS } from "@/lib/constants";

export function useMarginTrendData(days = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.marginTrend(days),
    queryFn: () => fetchMarginTrend(days),
  });
}

export function useDriverUtilizationData(days = 7) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.driverUtilization(days),
    queryFn: () => fetchDriverUtilization(days),
  });
}

export function useContainerTurnoverData(days = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.containerTurnover(days),
    queryFn: () => fetchContainerTurnover(days),
  });
}

export function useStreetTurnSavingsData(days = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.streetTurnSavings(days),
    queryFn: () => fetchStreetTurnSavings(days),
  });
}
