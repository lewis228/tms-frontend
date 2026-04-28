import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEquipmentPool } from "@/api/equipment-pool";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateEquipmentPool(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEquipmentPool,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.equipmentPool.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
