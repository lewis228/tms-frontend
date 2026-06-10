import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createLegsBulk, type LegCreatePayload } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateLegsBulk(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: LegCreatePayload[]) => createLegsBulk(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.containerV3.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
