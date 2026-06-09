import { useQuery } from "@tanstack/react-query";

import { fetchDriverRateAssignments } from "@/api/driver-rate-assignment";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useDriverRateAssignmentsData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.driverRateAssignment.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchDriverRateAssignments({ page, size: PAGE_SIZE }),
  });
}
