import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateRateSheet } from "@/api/rate-sheet";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: { note?: string | null };
};

export function useUpdateRateSheet(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateRateSheet(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateSheet.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateSheet.byId(id) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
