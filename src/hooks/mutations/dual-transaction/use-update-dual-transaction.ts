import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateDualTransaction } from "@/api/dual-transaction";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useUpdateDualTransaction(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDualTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dualTransaction.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
