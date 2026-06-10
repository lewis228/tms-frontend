import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLegAddon, type LegAddonUpdatePayload } from "@/api/leg-addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  legId: number;
  addonId: number;
  payload: LegAddonUpdatePayload;
};

export function useUpdateLegAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addonId, payload }: Vars) => updateLegAddon(addonId, payload),
    onSuccess: (_data, { legId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legAddon.byLeg(legId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
