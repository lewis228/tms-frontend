import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteDriverRateAssignment } from "@/api/driver-rate-assignment";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteDriverRateAssignment(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDriverRateAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.driverRateAssignment.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
