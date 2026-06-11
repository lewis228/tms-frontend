import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteServiceArea } from "@/api/service-area";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteServiceArea(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteServiceArea,
    onSuccess: () => {
      // 목록이 작아 invalidate 로 충분 (setQueryData filter 불필요).
      qc.invalidateQueries({ queryKey: QUERY_KEYS.serviceArea.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
