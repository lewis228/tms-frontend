import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTerminal } from "@/api/terminal";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: string;
  payload: Partial<{
    name: string;
    code: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    note: string | null;
  }>;
};

export function useUpdateTerminal(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateTerminal(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.terminal.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
