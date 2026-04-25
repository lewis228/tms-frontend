// Locations modal 의 customerId select 가 의존하므로 미리 작성. customers CRUD 본격 사용은 P3-E.
import { useQuery } from "@tanstack/react-query";

import { fetchCustomers } from "@/api/customer";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useCustomersData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.list({ page, size: PAGE_SIZE }),
    queryFn: () => fetchCustomers({ page, size: PAGE_SIZE }),
  });
}
