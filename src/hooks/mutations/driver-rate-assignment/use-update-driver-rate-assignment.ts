import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateDriverRateAssignment } from "@/api/driver-rate-assignment";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: Partial<{
    rateGroupId: number;
    effectiveFrom: string;
    effectiveTo: string | null;
    note: string | null;
  }>;
};

export function useUpdateDriverRateAssignment(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) =>
      updateDriverRateAssignment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.driverRateAssignment.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
