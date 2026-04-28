import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateChargeCode, type ChargeCodeUpdatePayload } from "@/api/charge-code";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useUpdateChargeCode(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChargeCodeUpdatePayload }) =>
      updateChargeCode(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.chargeCode.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
