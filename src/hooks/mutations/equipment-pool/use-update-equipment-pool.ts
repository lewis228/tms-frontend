import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateEquipmentPool,
  type EquipmentPoolUpdatePayload,
} from "@/api/equipment-pool";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useUpdateEquipmentPool(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EquipmentPoolUpdatePayload }) =>
      updateEquipmentPool(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.equipmentPool.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
