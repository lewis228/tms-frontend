import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLegCharge } from "@/api/leg-charge";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteLegCharge(
  legId: number | null | undefined,
  callbacks?: UseMutationCallback,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLegCharge,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legCharge.all });
      if (legId)
        qc.invalidateQueries({ queryKey: QUERY_KEYS.legCharge.byLeg(legId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
