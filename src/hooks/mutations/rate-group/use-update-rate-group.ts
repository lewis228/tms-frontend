import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateRateGroup } from "@/api/rate-group";
import { QUERY_KEYS } from "@/lib/constants";
import type { RateMethod, UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: Partial<{
    name: string;
    method: RateMethod;
    isDefault: boolean;
    isTemplate: boolean;
    description: string | null;
  }>;
};

export function useUpdateRateGroup(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateRateGroup(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateGroup.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
