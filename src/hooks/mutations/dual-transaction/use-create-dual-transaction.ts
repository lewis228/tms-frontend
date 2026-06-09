import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDualTransaction } from "@/api/dual-transaction";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateDualTransaction(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDualTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dualTransaction.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
