import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteInvoice } from "@/api/invoice";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteInvoice(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.invoice.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
