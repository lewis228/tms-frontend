import { useQuery } from "@tanstack/react-query";

import { fetchDualTransactions } from "@/api/dual-transaction";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";
import type { DualTransactionStatus } from "@/types";

export function useDualTransactionsData(
  page = 1,
  size = PAGE_SIZE,
  driverId?: number,
  status?: DualTransactionStatus,
) {
  return useQuery({
    queryKey: QUERY_KEYS.dualTransaction.list({ page, size, driverId, status }),
    queryFn: () => fetchDualTransactions({ page, size, driverId, status }),
  });
}
