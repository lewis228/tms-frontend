import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createChargeCode } from "@/api/charge-code";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateChargeCode(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createChargeCode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.chargeCode.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
