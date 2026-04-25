import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteVessel } from "@/api/vessel";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteVessel(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVessel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.vessel.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
