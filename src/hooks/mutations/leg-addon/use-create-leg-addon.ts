import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createLegAddon, type LegAddonCreatePayload } from "@/api/leg-addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  legId: number;
  payload: LegAddonCreatePayload;
};

export function useCreateLegAddon(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload }: Vars) => createLegAddon(payload),
    onSuccess: (_data, { legId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.legAddon.byLeg(legId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
