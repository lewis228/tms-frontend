import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateApiKey } from "@/api/api-key";
import { QUERY_KEYS } from "@/lib/constants";
import type { ApiKeyEntity, UseMutationCallback } from "@/types";

export function useUpdateApiKey(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateApiKey,
    onSuccess: (updated) => {
      // Patch the list cache in place — avoids a round-trip and keeps
      // scroll position on the table.
      qc.setQueryData<ApiKeyEntity[]>(QUERY_KEYS.apiKey.list, (prev) => {
        if (!prev) return prev;
        return prev.map((k) => (k.id === updated.id ? updated : k));
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
