import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateRatePoint } from "@/api/rate-point";
import { QUERY_KEYS } from "@/lib/constants";
import type { PointType, UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: Partial<{
    name: string;
    code: string | null;
    pointType: PointType;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    terminalId: number | null;
    locationId: number | null;
    note: string | null;
  }>;
};

export function useUpdateRatePoint(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateRatePoint(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ratePoint.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
