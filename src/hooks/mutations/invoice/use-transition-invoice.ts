import { useMutation, useQueryClient } from "@tanstack/react-query";

import { transitionInvoice } from "@/api/invoice";
import { QUERY_KEYS } from "@/lib/constants";
import type { InvoiceStatus, UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  target: InvoiceStatus;
};

export function useTransitionInvoice(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, target }: Vars) => transitionInvoice(id, target),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.invoice.byId(data.id), data);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.invoice.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
