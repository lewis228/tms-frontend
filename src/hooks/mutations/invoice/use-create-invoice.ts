import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createInvoice } from "@/api/invoice";
import { QUERY_KEYS } from "@/lib/constants";
import type { InvoiceDetailEntity, UseMutationCallback } from "@/types";

type Callbacks = Omit<UseMutationCallback, "onSuccess"> & {
  onSuccess?: (data: InvoiceDetailEntity) => void;
};

export function useCreateInvoice(callbacks?: Callbacks) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      qc.resetQueries({ queryKey: QUERY_KEYS.invoice.all });
      callbacks?.onSuccess?.(data);
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
