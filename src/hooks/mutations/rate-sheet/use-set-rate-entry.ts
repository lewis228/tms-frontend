import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setRateEntry, type SetRateEntryPayload } from "@/api/rate-sheet";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: SetRateEntryPayload;
};

export function useSetRateEntry(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => setRateEntry(id, payload),
    onSuccess: (_data, { id }) => {
      qc.resetQueries({ queryKey: QUERY_KEYS.rateSheet.entries(id) });
      qc.resetQueries({ queryKey: QUERY_KEYS.rateSheet.history(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateSheet.byId(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateSheet.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
