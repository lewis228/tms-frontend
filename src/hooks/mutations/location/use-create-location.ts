import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createLocation } from "@/api/location";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateLocation(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.location.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
