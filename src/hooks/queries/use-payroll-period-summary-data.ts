import { useQuery } from "@tanstack/react-query";

import { fetchPayrollPeriodSummary } from "@/api/payroll";
import { QUERY_KEYS } from "@/lib/constants";

export function usePayrollPeriodSummaryData(
  periodStart: string | null,
  periodEnd: string | null,
) {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.periodSummary({ periodStart, periodEnd }),
    queryFn: () =>
      fetchPayrollPeriodSummary({
        periodStart: periodStart!,
        periodEnd: periodEnd!,
      }),
    enabled: !!periodStart && !!periodEnd,
  });
}
