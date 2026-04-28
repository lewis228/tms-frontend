import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createStreetTurn } from "@/api/street-turn";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateStreetTurn(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStreetTurn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.streetTurn.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
