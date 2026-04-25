import { revokeApiKey } from "@/api/api-key";
import { QUERY_KEYS } from "@/lib/constants";
import type { ApiKeyEntity, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRevokeApiKey(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeApiKey,
    onSuccess: (revoked) => {
      // Soft delete — flip is_active locally so the row's status badge
      // updates from "Active" to "Revoked" without a network round-trip. The
      // next list refetch will drop the row entirely (backend filters
      // is_active=false out), but this keeps the UX smooth in the interim.
      queryClient.setQueryData<ApiKeyEntity[]>(
        QUERY_KEYS.apiKey.listByTeam(revoked.team_id),
        (prev) => {
          if (!prev) return prev;
          return prev.map((k) =>
            k.id === revoked.id ? { ...k, is_active: false } : k,
          );
        },
      );
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
