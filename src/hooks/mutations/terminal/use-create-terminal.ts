import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTerminal } from "@/api/terminal";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useCreateTerminal(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTerminal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.terminal.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
