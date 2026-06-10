import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAddon, type AddonCreatePayload } from "@/api/addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddonCreatePayload) => createAddon(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addon.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
