import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRateGroup } from "@/api/rate-group";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateRateGroup(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRateGroup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateGroup.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
