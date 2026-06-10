import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setRateGroupEntry } from "@/api/rate-group";
import { QUERY_KEYS } from "@/lib/constants";
import type { FlatRateEntryInput, UseMutationCallback } from "@/types";

export function useSetRateGroupEntry(
  groupId: number,
  callbacks?: UseMutationCallback,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FlatRateEntryInput) =>
      setRateGroupEntry(groupId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateGroup.entries(groupId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
