import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createServiceArea } from "@/api/service-area";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateServiceArea(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createServiceArea,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.serviceArea.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
