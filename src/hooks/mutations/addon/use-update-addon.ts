import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAddon, type AddonUpdatePayload } from "@/api/addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: number; payload: AddonUpdatePayload };

export function useUpdateAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateAddon(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addon.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
