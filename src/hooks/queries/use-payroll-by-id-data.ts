import { useQuery } from "@tanstack/react-query";

import { fetchPayroll } from "@/api/payroll";
import { QUERY_KEYS } from "@/lib/constants";

export function usePayrollByIdData(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.byId(id ?? 0),
    queryFn: () => fetchPayroll(id!),
    enabled: id != null,
  });
}
