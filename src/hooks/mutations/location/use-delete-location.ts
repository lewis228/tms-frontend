import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLocation } from "@/api/location";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteLocation(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.location.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
