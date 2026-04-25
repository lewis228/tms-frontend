import { createTag } from "@/api/tag";
import { QUERY_KEYS } from "@/lib/constants";
import type { TagEntity } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// We need the created tag flowing back so the Track form can auto-select the
// new row right after `+ Create new tag` inline creation — the generic
// UseMutationCallback's onSuccess is parameterless. Same pattern as
// useCreateOceanShipment.
type Callbacks = {
  onSuccess?: (created: TagEntity) => void;
  onError?: (error: Error) => void;
};

export function useCreateTag(callbacks?: Callbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: (created) => {
      // `all` covers every team bucket — cheap and future-proof, since the
      // tag list is small and the request is rare.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tag.all });
      if (callbacks?.onSuccess) callbacks.onSuccess(created);
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
