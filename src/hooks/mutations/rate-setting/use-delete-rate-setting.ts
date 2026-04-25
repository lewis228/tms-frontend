import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRateSetting } from "@/api/rate-setting";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteRateSetting(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRateSetting,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateSetting.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
