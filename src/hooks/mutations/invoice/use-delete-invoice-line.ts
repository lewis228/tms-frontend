import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteInvoiceLine } from "@/api/invoice";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  lineId: number;
};

export function useDeleteInvoiceLine(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lineId }: Vars) => deleteInvoiceLine(id, lineId),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.invoice.byId(data.id), data);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.invoice.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
