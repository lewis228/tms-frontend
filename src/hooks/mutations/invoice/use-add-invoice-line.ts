import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addInvoiceLine, type InvoiceLineCreatePayload } from "@/api/invoice";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: InvoiceLineCreatePayload;
};

export function useAddInvoiceLine(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => addInvoiceLine(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.invoice.byId(data.id), data);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.invoice.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
