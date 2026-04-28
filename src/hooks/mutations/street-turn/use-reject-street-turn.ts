import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rejectStreetTurn } from "@/api/street-turn";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useRejectStreetTurn(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectStreetTurn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.streetTurn.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
