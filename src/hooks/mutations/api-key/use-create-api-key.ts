import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createApiKey } from "@/api/api-key";
import { QUERY_KEYS } from "@/lib/constants";
import type { ApiKeyCreated } from "@/types";

// Custom callback shape — unlike most mutations in this project, this one
// needs to surface the full (secret) key to the caller so the post-create
// reveal modal can display it. The project's generic `UseMutationCallback`
// has a parameterless `onSuccess` and can't carry a payload; hence the
// bespoke type here.
type Callbacks = {
  onSuccess?: (created: ApiKeyCreated) => void;
  onError?: (error: Error) => void;
};

export function useCreateApiKey(callbacks?: Callbacks) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createApiKey,
    onSuccess: (created) => {
      // Refresh the list view so the new row (prefix-only projection)
      // appears. We can't setQueryData in place because the server omits
      // the full `key` from list payloads — adding a synthetic row risks
      // drift if server adds fields later.
      qc.invalidateQueries({ queryKey: QUERY_KEYS.apiKey.all });
      callbacks?.onSuccess?.(created);
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
