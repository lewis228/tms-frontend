import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLegStop } from "@/api/leg-stop";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteLegStop(
  legId: number | null | undefined,
  callbacks?: UseMutationCallback,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLegStop,
    onSuccess: () => {
      if (legId)
        qc.invalidateQueries({ queryKey: QUERY_KEYS.legStop.byLeg(legId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
