import { deleteTag } from "@/api/tag";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTag(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tag.all });
      // Shipments carry the tag; soft-delete means historical attachments
      // stay resolvable but list/detail chips should re-filter.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.oceanShipment.all });
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
