import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAddon } from "@/api/addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAddon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addon.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
