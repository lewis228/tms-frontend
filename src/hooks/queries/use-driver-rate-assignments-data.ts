import { useQuery } from "@tanstack/react-query";

import { fetchDriverRateAssignments } from "@/api/driver-rate-assignment";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

// 백엔드 cursor pagination 은 page 이동을 지원하지 않으므로 size(take)만 받는다.
// 리스트는 size 를 크게 받아 클라이언트에서 페이지 슬라이스한다.
export function useDriverRateAssignmentsData(params: { size?: number } = {}) {
  const size = params.size ?? PAGE_SIZE;
  return useQuery({
    queryKey: QUERY_KEYS.driverRateAssignment.list({ size }),
    queryFn: () => fetchDriverRateAssignments({ size }),
  });
}
