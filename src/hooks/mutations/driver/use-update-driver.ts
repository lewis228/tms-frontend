import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateDriver } from "@/api/driver";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: Partial<{
    name: string;
    phone: string | null;
    licenseNumber: string | null;
    licenseState: string | null;
    truckNumber: string | null;
    isActive: boolean;
    note: string | null;
  }>;
};

export function useUpdateDriver(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateDriver(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.driver.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
