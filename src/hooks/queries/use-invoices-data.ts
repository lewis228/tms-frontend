import { useQuery } from "@tanstack/react-query";

import { fetchInvoices } from "@/api/invoice";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";
import type { InvoiceStatus } from "@/types";

export function useInvoicesData(
  page: number = 1,
  customerId?: number,
  status?: InvoiceStatus,
) {
  return useQuery({
    queryKey: QUERY_KEYS.invoice.list({
      page,
      size: PAGE_SIZE,
      customerId,
      status,
    }),
    queryFn: () => fetchInvoices({ page, size: PAGE_SIZE, customerId, status }),
  });
}
