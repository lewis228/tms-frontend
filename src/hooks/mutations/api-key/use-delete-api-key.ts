import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiKey } from "@/api/api-key";
import { QUERY_KEYS } from "@/lib/constants";
import type { ApiKeyEntity, UseMutationCallback } from "@/types";

export function useDeleteApiKey(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteApiKey,
    onSuccess: (revoked) => {
      // Soft delete — flip is_active locally so the row's status badge
      // updates from "Active" to "Revoked" without a network round-trip. The
      // next list refetch will drop the row entirely (backend filters
      // is_active=false out), but this keeps the UX smooth in the interim.
      qc.setQueryData<ApiKeyEntity[]>(QUERY_KEYS.apiKey.list, (prev) => {
        if (!prev) return prev;
        return prev.map((k) =>
          k.id === revoked.id ? { ...k, isActive: false } : k,
        );
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
