import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveStreetTurn } from "@/api/street-turn";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useApproveStreetTurn(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveStreetTurn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.streetTurn.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.container.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
