import { useQuery } from "@tanstack/react-query";

import { fetchPayrolls } from "@/api/payroll";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";
import type { PayrollStatus } from "@/types";

export function usePayrollsData(
  page: number = 1,
  driverId?: number,
  status?: PayrollStatus,
) {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.list({
      page,
      size: PAGE_SIZE,
      driverId,
      status,
    }),
    queryFn: () => fetchPayrolls({ page, size: PAGE_SIZE, driverId, status }),
  });
}
