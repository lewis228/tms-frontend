import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteCustomer } from "@/api/customer";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteCustomer(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.customer.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
