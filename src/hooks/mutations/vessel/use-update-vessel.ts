import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateVessel } from "@/api/vessel";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback, VesselEntity } from "@/types";

type Vars = { id: number; payload: Partial<Omit<VesselEntity, "id" | "tenantId" | "createdAt" | "updatedAt">> };

export function useUpdateVessel(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateVessel(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.vessel.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
