import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteEquipmentPool } from "@/api/equipment-pool";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteEquipmentPool(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEquipmentPool,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.equipmentPool.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
