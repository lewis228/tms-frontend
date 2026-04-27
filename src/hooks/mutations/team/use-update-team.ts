import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTeam, type TeamWritePayload } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: Partial<TeamWritePayload & { isActive: boolean }>;
};

export function useUpdateTeam(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateTeam(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
