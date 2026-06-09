import { useQuery } from "@tanstack/react-query";

import { fetchInvoice } from "@/api/invoice";
import { QUERY_KEYS } from "@/lib/constants";

export function useInvoiceByIdData(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.invoice.byId(id ?? 0),
    queryFn: () => fetchInvoice(id!),
    enabled: id != null,
  });
}
