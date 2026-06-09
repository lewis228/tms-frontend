import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelDualTransaction } from "@/api/dual-transaction";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCancelDualTransaction(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelDualTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dualTransaction.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
