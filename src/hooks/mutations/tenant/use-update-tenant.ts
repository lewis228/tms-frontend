import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTenant } from "@/api/tenant";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: Partial<{
    name: string;
    planTier: string;
    timezone: string;
    isActive: boolean;
    contactEmail: string | null;
    contactPhone: string | null;
  }>;
};

export function useUpdateTenant(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateTenant(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tenant.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
