import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDriverRateAssignment } from "@/api/driver-rate-assignment";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateDriverRateAssignment(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDriverRateAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.driverRateAssignment.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
