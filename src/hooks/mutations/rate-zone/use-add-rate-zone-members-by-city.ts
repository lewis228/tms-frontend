import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addRateZoneMembersByCity } from "@/api/rate-zone";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  city: string;
  state: string;
};

export function useAddRateZoneMembersByCity(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, city, state }: Vars) =>
      addRateZoneMembersByCity(id, city, state),
    onSuccess: (_data, { id }) => {
      qc.resetQueries({ queryKey: QUERY_KEYS.rateZone.members(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateZone.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
