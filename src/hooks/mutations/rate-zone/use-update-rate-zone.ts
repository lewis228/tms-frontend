import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateRateZone } from "@/api/rate-zone";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback, ZoneKind } from "@/types";

type Vars = {
  id: number;
  payload: Partial<{
    name: string;
    code: string | null;
    color: string | null;
    kind: ZoneKind;
    rateGroupId: number | null;
    geojson: Record<string, unknown> | null;
    description: string | null;
  }>;
};

export function useUpdateRateZone(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateRateZone(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateZone.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
