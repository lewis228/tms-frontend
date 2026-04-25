import { updateApiKey } from "@/api/api-key";
import { QUERY_KEYS } from "@/lib/constants";
import type { ApiKeyEntity, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateApiKey(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApiKey,
    onSuccess: (updated) => {
      // Patch the list cache in place — avoids a round-trip and keeps
      // scroll position on the table.
      queryClient.setQueryData<ApiKeyEntity[]>(
        QUERY_KEYS.apiKey.listByTeam(updated.team_id),
        (prev) => {
          if (!prev) return prev;
          return prev.map((k) => (k.id === updated.id ? updated : k));
        },
      );
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
