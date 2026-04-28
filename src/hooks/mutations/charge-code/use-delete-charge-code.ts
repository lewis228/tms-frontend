import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteChargeCode } from "@/api/charge-code";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteChargeCode(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteChargeCode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.chargeCode.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
