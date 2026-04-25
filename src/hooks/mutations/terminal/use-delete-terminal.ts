import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTerminal } from "@/api/terminal";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteTerminal(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTerminal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.terminal.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
