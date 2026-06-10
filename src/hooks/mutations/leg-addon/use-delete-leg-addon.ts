import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLegAddon } from "@/api/leg-addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  legId: number;
  addonId: number;
};

export function useDeleteLegAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addonId }: Vars) => deleteLegAddon(addonId),
    onSuccess: (_data, { legId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legAddon.byLeg(legId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
